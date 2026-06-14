(function () {
  const info = {
    total: [0, 26, 44, 70, 100, 134, 172, 196, 242],
    data: [0, 19, 34, 55, 80, 108, 136, 156, 194],
    ec: [0, 7, 10, 15, 20, 26, 18, 20, 24],
    blocks: [0, 1, 1, 1, 1, 1, 2, 2, 2],
    align: {
      1: [],
      2: [6, 18],
      3: [6, 22],
      4: [6, 26],
      5: [6, 30],
      6: [6, 34],
      7: [6, 22, 38],
      8: [6, 24, 42]
    }
  };

  function matrix(text) {
    const data = new TextEncoder().encode(text);
    const version = pickVersion(data.length);
    const size = 21 + (version - 1) * 4;
    const modules = Array.from({ length: size }, () => Array(size).fill(null));
    const reserved = Array.from({ length: size }, () => Array(size).fill(false));
    const codewords = addEc(dataCodewords(data, version), version);
    const bits = codewords.flatMap((byte) => Array.from({ length: 8 }, (_, index) => ((byte >>> (7 - index)) & 1) === 1));

    drawFunctions(modules, reserved, version);
    placeData(modules, reserved, bits);

    let best = null;
    for (let mask = 0; mask < 8; mask += 1) {
      const candidate = modules.map((row) => row.slice());
      applyMask(candidate, reserved, mask);
      drawFormat(candidate, reserved, mask);
      const score = penalty(candidate);
      if (!best || score < best.score) best = { matrix: candidate, score };
    }
    return best.matrix;
  }

  function pickVersion(byteLength) {
    const needed = 4 + 8 + byteLength * 8;
    for (let version = 1; version < info.data.length; version += 1) {
      if (needed <= info.data[version] * 8) return version;
    }
    throw new Error("当前页面 URL 过长，无法生成二维码。");
  }

  function dataCodewords(data, version) {
    const bits = [];
    append(bits, 0x4, 4);
    append(bits, data.length, 8);
    data.forEach((byte) => append(bits, byte, 8));
    const capacity = info.data[version] * 8;
    append(bits, 0, Math.min(4, capacity - bits.length));
    while (bits.length % 8 !== 0) bits.push(false);

    const bytes = [];
    for (let index = 0; index < bits.length; index += 8) {
      let value = 0;
      for (let bit = 0; bit < 8; bit += 1) value = (value << 1) | (bits[index + bit] ? 1 : 0);
      bytes.push(value);
    }
    for (let pad = 0; bytes.length < info.data[version]; pad += 1) bytes.push(pad % 2 === 0 ? 0xec : 0x11);
    return bytes;
  }

  function append(bits, value, length) {
    for (let index = length - 1; index >= 0; index -= 1) bits.push(((value >>> index) & 1) === 1);
  }

  function addEc(data, version) {
    const blocks = info.blocks[version];
    const ecLength = info.ec[version];
    const blockSize = data.length / blocks;
    const generator = generatorPoly(ecLength);
    const dataBlocks = [];
    const ecBlocks = [];

    for (let block = 0; block < blocks; block += 1) {
      const chunk = data.slice(block * blockSize, (block + 1) * blockSize);
      dataBlocks.push(chunk);
      ecBlocks.push(remainder(chunk, generator));
    }

    const result = [];
    for (let index = 0; index < blockSize; index += 1) dataBlocks.forEach((block) => result.push(block[index]));
    for (let index = 0; index < ecLength; index += 1) ecBlocks.forEach((block) => result.push(block[index]));
    return result;
  }

  function generatorPoly(degree) {
    let result = [1];
    for (let index = 0; index < degree; index += 1) result = polyMultiply(result, [1, gfPow(2, index)]);
    return result;
  }

  function remainder(data, generator) {
    const result = Array(generator.length - 1).fill(0);
    data.forEach((byte) => {
      const factor = byte ^ result.shift();
      result.push(0);
      generator.slice(1).forEach((coefficient, index) => {
        result[index] ^= gfMultiply(coefficient, factor);
      });
    });
    return result;
  }

  function polyMultiply(left, right) {
    const result = Array(left.length + right.length - 1).fill(0);
    left.forEach((a, i) => right.forEach((b, j) => {
      result[i + j] ^= gfMultiply(a, b);
    }));
    return result;
  }

  function gfMultiply(left, right) {
    let result = 0;
    for (; right > 0; right >>>= 1) {
      if (right & 1) result ^= left;
      left <<= 1;
      if (left & 0x100) left ^= 0x11d;
    }
    return result;
  }

  function gfPow(value, exponent) {
    let result = 1;
    for (let index = 0; index < exponent; index += 1) result = gfMultiply(result, value);
    return result;
  }

  function drawFunctions(modules, reserved, version) {
    const size = modules.length;
    finder(modules, reserved, 0, 0);
    finder(modules, reserved, size - 7, 0);
    finder(modules, reserved, 0, size - 7);

    for (let index = 8; index < size - 8; index += 1) {
      set(modules, reserved, 6, index, index % 2 === 0, true);
      set(modules, reserved, index, 6, index % 2 === 0, true);
    }

    const positions = info.align[version];
    positions.forEach((x) => positions.forEach((y) => {
      if ((x === 6 && y === 6) || (x === 6 && y === size - 7) || (x === size - 7 && y === 6)) return;
      alignment(modules, reserved, x, y);
    }));

    reserveFormat(modules, reserved);
    set(modules, reserved, 8, size - 8, true, true);
  }

  function finder(modules, reserved, x, y) {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= modules.length || yy >= modules.length) continue;
        const dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        set(modules, reserved, xx, yy, dark, true);
      }
    }
  }

  function alignment(modules, reserved, cx, cy) {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        set(modules, reserved, cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1, true);
      }
    }
  }

  function reserveFormat(modules, reserved) {
    const size = modules.length;
    for (let index = 0; index <= 8; index += 1) {
      if (index !== 6) {
        set(modules, reserved, 8, index, false, true);
        set(modules, reserved, index, 8, false, true);
      }
    }
    for (let index = 0; index < 8; index += 1) {
      set(modules, reserved, size - 1 - index, 8, false, true);
      set(modules, reserved, 8, size - 1 - index, false, true);
    }
  }

  function set(modules, reserved, x, y, dark, markReserved) {
    modules[y][x] = dark;
    if (markReserved) reserved[y][x] = true;
  }

  function placeData(modules, reserved, bits) {
    const size = modules.length;
    let bit = 0;
    let upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right -= 1;
      for (let vert = 0; vert < size; vert += 1) {
        const y = upward ? size - 1 - vert : vert;
        for (let dx = 0; dx < 2; dx += 1) {
          const x = right - dx;
          if (!reserved[y][x]) {
            modules[y][x] = bit < bits.length ? bits[bit] : false;
            bit += 1;
          }
        }
      }
      upward = !upward;
    }
  }

  function applyMask(modules, reserved, mask) {
    for (let y = 0; y < modules.length; y += 1) {
      for (let x = 0; x < modules.length; x += 1) {
        if (!reserved[y][x] && maskAt(mask, x, y)) modules[y][x] = !modules[y][x];
      }
    }
  }

  function maskAt(mask, x, y) {
    switch (mask) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
      case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
      case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
      case 7: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
      default: return false;
    }
  }

  function drawFormat(modules, reserved, mask) {
    const size = modules.length;
    const bits = formatBits(mask);
    for (let i = 0; i <= 5; i += 1) set(modules, reserved, 8, i, ((bits >>> i) & 1) === 1, true);
    set(modules, reserved, 8, 7, ((bits >>> 6) & 1) === 1, true);
    set(modules, reserved, 8, 8, ((bits >>> 7) & 1) === 1, true);
    set(modules, reserved, 7, 8, ((bits >>> 8) & 1) === 1, true);
    for (let i = 9; i < 15; i += 1) set(modules, reserved, 14 - i, 8, ((bits >>> i) & 1) === 1, true);
    for (let i = 0; i < 8; i += 1) set(modules, reserved, size - 1 - i, 8, ((bits >>> i) & 1) === 1, true);
    for (let i = 8; i < 15; i += 1) set(modules, reserved, 8, size - 15 + i, ((bits >>> i) & 1) === 1, true);
  }

  function formatBits(mask) {
    const levelL = 1;
    const data = (levelL << 3) | mask;
    let value = data << 10;
    for (let bit = 14; bit >= 10; bit -= 1) {
      if (((value >>> bit) & 1) !== 0) value ^= 0x537 << (bit - 10);
    }
    return ((data << 10) | value) ^ 0x5412;
  }

  function penalty(modules) {
    const size = modules.length;
    let total = 0;
    for (let y = 0; y < size; y += 1) total += runPenalty(modules[y]);
    for (let x = 0; x < size; x += 1) total += runPenalty(modules.map((row) => row[x]));
    for (let y = 0; y < size - 1; y += 1) {
      for (let x = 0; x < size - 1; x += 1) {
        const color = modules[y][x];
        if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) total += 3;
      }
    }
    const lines = [
      ...modules.map((row) => row.map(Number).join("")),
      ...Array.from({ length: size }, (_, x) => modules.map((row) => Number(row[x])).join(""))
    ];
    lines.forEach((line) => {
      for (let index = 0; index <= line.length - 11; index += 1) {
        const slice = line.slice(index, index + 11);
        if (slice === "10111010000" || slice === "00001011101") total += 40;
      }
    });
    const dark = modules.flat().filter(Boolean).length;
    return total + Math.floor(Math.abs((dark * 20) / (size * size) - 10)) * 10;
  }

  function runPenalty(line) {
    let total = 0;
    let color = line[0];
    let length = 1;
    for (let index = 1; index < line.length; index += 1) {
      if (line[index] === color) {
        length += 1;
      } else {
        if (length >= 5) total += length - 2;
        color = line[index];
        length = 1;
      }
    }
    if (length >= 5) total += length - 2;
    return total;
  }

  function drawToCanvas(canvas, text) {
    if (!canvas) return;
    drawToContext(canvas.getContext("2d"), text, 0, 0, canvas.width);
  }

  function drawToContext(ctx, text, x, y, size) {
    const qr = matrix(text);
    const quiet = 4;
    const cell = size / (qr.length + quiet * 2);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#17130f";
    qr.forEach((row, rowIndex) => row.forEach((dark, colIndex) => {
      if (dark) {
        ctx.fillRect(
          x + (colIndex + quiet) * cell,
          y + (rowIndex + quiet) * cell,
          Math.ceil(cell),
          Math.ceil(cell)
        );
      }
    }));
  }

  window.UGTI_QR = { matrix, drawToCanvas, drawToContext };
})();
