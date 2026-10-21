document.addEventListener("DOMContentLoaded", () => {
  const joinForm = document.querySelector("#join-form");
  if (joinForm) {
    joinForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = document.querySelector("#session-code");
      const error = document.querySelector("#join-error");
      const submitButton = joinForm.querySelector('button[type="submit"]');
      if (!input.value.trim()) {
        error.textContent = "Please enter the session code provided by your instructor.";
        error.classList.remove("hidden");
        input.focus();
        return;
      }
      const code = input.value.trim().toUpperCase();
      if (!/^[A-Z0-9]{6}$/.test(code)) {
        error.textContent = "Please enter the session code provided by your instructor.";
        error.classList.remove("hidden");
        input.focus();
        return;
      }
      // Prevent duplicate requests while checking the code.
      submitButton.disabled = true;
      error.classList.add("hidden");

      try {
        const response = await fetch(
          `/joinsession?sid=${encodeURIComponent(code)}`,
          {
            method: "GET",
            headers: {
              "Accept": "application/json"
            }
          }
        );

        if (response.status === 200) {
          window.location.href = ".";
        } else if (response.status === 404) {
          error.textContent =
            "We couldn't find an active session with that code. " +
            "Check the code or ask your instructor.";
          error.classList.remove("hidden");
        } else {
          error.textContent =
            "Something went wrong, Please try again.";
          error.classList.remove("hidden");
        }
      } catch (err) {
        error.textContent =
          "Unable to contact the server. " +
          "Check your connection and try again.";
        error.classList.remove("hidden");
      } finally {
        submitButton.disabled = false;
      }
    });
  }
  const currentYear = new Date().getFullYear();
  document.getElementById('copyright-year').textContent = currentYear;
});

