/**
 * @typedef ColorSchema ("dark"|"light")
 */

/**
 * @return {boolean}
 */
const isDark = () => {
  return globalThis.window.matchMedia &&
    globalThis.window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * @return {ColorSchema}
 */
export const getCurrentColorScheme = () => {
  if (localStorage.getItem("color-scheme")) {
    return localStorage.getItem("color-scheme") === "dark" ? "dark" : "light";
  }

  return isDark() ? "dark" : "light";
};

/**
 * @param {ColorSchema} colorScheme
 * @return void
 */
export const setColorScheme = (colorScheme) => {
  /**
   * @type {colorScheme} setColor
   */
  const setColor = colorScheme === "light" ? "light" : "dark";

  /**
   * @type {colorScheme} removeColor
   */
  const removeColor = colorScheme === "light" ? "dark" : "light";

  [document.body].forEach((element) => {
    element.classList.add(setColor);
    element.classList.remove(removeColor);
  });

  localStorage.setItem("color-scheme", setColor);

  globalThis.dispatchEvent(
    new CustomEvent("changeColorScheme", {
      detail: {
        colorScheme: getCurrentColorScheme(),
      },
    }),
  );
};

setColorScheme(getCurrentColorScheme());
