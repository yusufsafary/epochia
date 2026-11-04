function setLang(l) {
  document.documentElement.setAttribute("data-lang", l);
  try { localStorage.setItem("ab-lang", l); } catch (e) {}
  var en = document.getElementById("swEn"), zh = document.getElementById("swZh");
  if (en) en.classList.toggle("on", l === "en");
  if (zh) zh.classList.toggle("on", l === "zh");
  document.documentElement.lang = l === "zh" ? "zh-Hant" : "en";
}
(function () {
  var saved = "en";
  try { saved = localStorage.getItem("ab-lang") || "en"; } catch (e) {}
  setLang(saved === "zh" ? "zh" : "en");
})();
