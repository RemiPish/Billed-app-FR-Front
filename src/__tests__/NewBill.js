/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import store from "../app/store";
import mockStore from "../__mocks__/store"
import userEvent from '@testing-library/user-event'


describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    jest.spyOn(store, "bills");
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "employee@test.tld",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
  });
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {


      window.onNavigate(ROUTES_PATH.NewBill)

      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      const activeIcon = mailIcon.classList.contains('active-icon')

      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getAllByTestId("form-new-bill")).toBeTruthy();
      expect(activeIcon).toBeTruthy();

    })
    describe("When I fill the form", () => {
      describe("When the file extension is not correct", () => {
        test("Then the file is not accepted", async () => {
          document.body.innerHTML = NewBillUI();

          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          };
          const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage });


          const formInputFile = screen.getByTestId("file");
          const testFile = new File(["test.txt"], "test.txt", { type: "text/plain" });
          const errorMessage = screen.getByTestId("wrong-extension");

          userEvent.upload(formInputFile, testFile);

          expect(formInputFile.files[0].name).toBe("test.txt");
          expect(errorMessage.textContent).toBe("Votre fichier doit être de l'extension .png, .jpeg ou .jpg!");

        })
      })
    })

    describe("When I fill the form", () => {
      describe("When the file extension is correct", () => {
        test("Then the file is accepted", async () => {
          document.body.innerHTML = NewBillUI();

          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          };
          const newBill = new NewBill({ document, onNavigate, mockStore, localStorage: window.localStorage });


          const formInputFile = screen.getByTestId("file");
          const testFile = new File([""], "test.png", { type: "image/png" });
          const errorMessage = screen.getByTestId("wrong-extension");

          userEvent.upload(formInputFile, testFile);

          expect(formInputFile.files[0].name).toBe("test.png");
          expect(errorMessage.textContent).toBe("");

        })
      })
    })

  })

})
