/**
 * survey-form
 */

(function() {
  function main() {
    const form = document.querySelector("#survey-form");
    const btn = form.querySelector("button[type='submit']");

    btn.addEventListener("click", e => onClickSubmit(e, form));
  }

  function onClickSubmit(ev, form) {
    ev.preventDefault();

    if (!validate(form)) {
      return;
    }

    const btn = ev.target;
    btn.disabled = true;
    btn.classList.add("submit-btn_disabled");
    btn.innerText = "Loading...";

    send(new FormData(form), err => {
      const status = document.querySelector(".submit-status");
      if (err) {
        status.innerText =
          "Sorry, an error occurred while sending your response, try later, please";
        // Logging...
      }

      btn.classList.add("hidden");
      status.classList.remove("hidden");
    });
  }

  function validate(form) {
    return form.reportValidity();
  }

  function send(data, cb) {
    axios
      .post("/survey", data)
      .then(function(response) {
        cb(null, response);
      })
      .catch(function(error) {
        cb(error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
