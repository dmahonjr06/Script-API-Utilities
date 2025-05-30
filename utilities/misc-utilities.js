export class MiscUtils {

  /**
    * @author frostice482
    * 
    * Renames function name
    * @param fn Function
    * @param name New function name
    * @returns function
    */
  static renameFn(fn, name) {
    return Object.defineProperty(fn, "name", { value: name })
  }

}

/**
 * A fixed-size FIFO (First In, First Out) memory buffer that stores generic data.
 * Automatically removes oldest items when exceeding max size.
 * 
 * @template T
 * @author https://github.com/IWantANeko
 * @license MIT
 */
export class MemoryBuffer {
  /**
   * @param {number} maxSize - Maximum number of items the buffer can hold.
   * @throws {Error} If maxSize is not greater than 0.
   */
  constructor(maxSize) {
    if (maxSize <= 0) throw new Error("maxSize must be greater than 0");
    /** @private @type {T[]} */
    this.buffer = [];
    /** @readonly @type {number} */
    this.maxSize = maxSize;
  }

  /**
   * @returns {number} Current number of items in the buffer.
   */
  get length() {
    return this.buffer.length;
  }

  /**
   * @returns {boolean} True if the buffer is empty.
   */
  isEmpty() {
    return this.buffer.length === 0;
  }

  /**
   * @returns {boolean} True if the buffer has reached its maximum size.
   */
  isFull() {
    return this.buffer.length >= this.maxSize;
  }

  /**
   * Adds items to the buffer. If it exceeds the max size, oldest items are removed.
   * @param {T[]} datas - Items to add to the buffer.
   */
  add(datas) {
    const inTotal = datas.length + this.buffer.length;

    if (inTotal > this.maxSize) {
      this.buffer.splice(0, inTotal - this.maxSize);
    }

    this.buffer.push(...datas);
  }

  /**
   * Returns a copy of the entire buffer.
   * @returns {T[]}
   */
  getBuffer() {
    return [...this.buffer];
  }

  /**
   * Retrieves a number of items from the start of the buffer.
   * Optionally removes them.
   * @param {number} [amount=Infinity] - Number of items to retrieve.
   * @param {boolean} [remove=false] - Whether to remove the items.
   * @returns {T[]}
   */
  get(amount = Infinity, remove = false) {
    amount = Math.min(amount, this.buffer.length);
    return remove ? this.buffer.splice(0, amount) : this.buffer.slice(0, amount);
  }

  /**
   * Retrieves the first item in the buffer.
   * Optionally removes it.
   * @param {boolean} [remove=false]
   * @returns {T | undefined}
   */
  getFirst(remove = false) {
    return this.buffer.length === 0 ? undefined : remove ? this.buffer.shift() : this.buffer[0];
  }

  /**
   * Retrieves the last item in the buffer.
   * Optionally removes it.
   * @param {boolean} [remove=false]
   * @returns {T | undefined}
   */
  getLast(remove = false) {
    return this.buffer.length === 0 ? undefined : remove ? this.buffer.pop() : this.buffer[this.buffer.length - 1];
  }

  /**
   * Clears all items from the buffer.
   */
  clear() {
    this.buffer.length = 0;
  }
}