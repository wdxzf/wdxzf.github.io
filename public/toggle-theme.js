const primaryColorScheme = ""; // "light" | "dark"

// Get theme data from local storage
const currentTheme = localStorage.getItem("theme");

function getPreferTheme() {
  // return theme value in local storage if it is set
  if (currentTheme) return currentTheme;

  // return primary color scheme if it is set
  if (primaryColorScheme) return primaryColorScheme;

  // return user device's prefer color scheme
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

let themeValue = getPreferTheme();

function setPreference() {
  localStorage.setItem("theme", themeValue);
  reflectPreference();
}

function reflectPreference() {
  document.firstElementChild.setAttribute("data-theme", themeValue);
  const nextTheme = themeValue === "light" ? "dark" : "light";
  const button = document.querySelector("#theme-btn");
  button?.setAttribute("aria-label", `切换到${nextTheme === "dark" ? "深色" : "浅色"}模式`);
  button?.setAttribute("title", `切换到${nextTheme === "dark" ? "深色" : "浅色"}模式`);
  button?.setAttribute("aria-pressed", String(themeValue === "dark"));
}

// set early so no page flashes / CSS is made aware
reflectPreference();

function init() {
  // set on load so screen readers can get the latest value on the button
  reflectPreference();

  // now this script can find and listen for clicks on the control
  document.querySelector("#theme-btn")?.addEventListener("click", () => {
    themeValue = themeValue === "light" ? "dark" : "light";
    setPreference();
  });
  document.querySelector("#theme-btn-mobile")?.addEventListener("click", () => {
    themeValue = themeValue === "light" ? "dark" : "light";
    setPreference();
  });
}


window.onload = () => {
  init()
};

// sync with system changes
window.matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({matches: isDark}) => {
    themeValue = isDark ? "dark" : "light";
    setPreference();
  });
