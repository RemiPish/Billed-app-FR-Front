/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import BillsUI from "../views/BillsUI.js";
import router from "../app/Router.js";
import store from "../__mocks__/store.js";
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/extend-expect'

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee', email: "employee@test.tld"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router();
      window.onNavigate(ROUTES_PATH['NewBill'])
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      const activeIcon = mailIcon.classList.contains('active-icon')

      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getAllByTestId("form-new-bill")).toBeTruthy();
      expect(activeIcon).toBeTruthy();

    })
  })
  describe("When I select an image in a correct format", () => {
    test("Then the input file should display the file name", () => {

      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const formFileInput = screen.getByTestId('file');
      formFileInput.addEventListener('change', handleChangeFile);


      fireEvent.change(formFileInput, {
        target: {
          files: [new File(['test.png'], 'test.png', {
            type: 'image/png'
          })],
        }
      })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(formFileInput.files[0].name).toBe('test.png');


    })
    test("Then a bill is created", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
      const errorMessage = screen.getByTestId("wrong-extension");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const submit = screen.getByTestId('form-new-bill');
      submit.addEventListener('submit', handleSubmit);
      const rightExtension = errorMessage.classList.contains('right-extension')
      const wrongExtension = errorMessage.classList.contains('wrong-extension')
      expect(rightExtension).toBeTruthy();
      expect(wrongExtension).toBeFalsy();

      fireEvent.submit(submit)
      expect(handleSubmit).toHaveBeenCalled();

    })
  })
  describe("When I fill the form", () => {
    describe("When the file extension is not correct", () => {
      test("Then the file is not accepted", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        const input = screen.getByTestId('file');
        input.addEventListener('change', handleChangeFile);

        fireEvent.change(input, {
          target: {
            files: [new File(['test.txt'], 'test.txt', {
              type: 'image/txt'
            })],
          }
        })
        const errorMessage = screen.getByTestId("wrong-extension");
        expect(handleChangeFile).toHaveBeenCalled()
        expect(input.files[0].name).toBe('test.txt');

        expect(handleChangeFile).toHaveBeenCalled();
        const rightExtension = errorMessage.classList.contains('right-extension')
        const wrongExtension = errorMessage.classList.contains('wrong-extension')
        expect(wrongExtension).toBeTruthy();
        expect(rightExtension).toBeFalsy();
      })
    })
  })

  // test d'intégration POST
  describe("Given I am a user connected as Employee", () => {
    describe("When I add a new bill", () => {
      test("Then it creates a new bill", () => {
        document.body.innerHTML = NewBillUI()

        const inputExpenseName = screen.getByTestId('expense-name')
        const inputExpenseType = screen.getByTestId('expense-type')
        const inputDatepicker = screen.getByTestId('datepicker')
        const inputAmount = screen.getByTestId('amount')
        const inputVAT = screen.getByTestId('vat')
        const inputPCT = screen.getByTestId('pct')
        const inputCommentary = screen.getByTestId('commentary')
        const inputFile = screen.getByTestId('file')

    
        fireEvent.change(inputExpenseType, {
          target: { value: "Transports" },
        })
        expect(inputExpenseType.value).toBe("Transports" )

        fireEvent.change(inputExpenseName, {
          target: { value: "transport" },
        })
        expect(inputExpenseName.value).toBe("transport")

        fireEvent.change(inputDatepicker, {
          target: { value: "2023-03-17" },
        })
        expect(inputDatepicker.value).toBe("2023-03-17")

        fireEvent.change(inputAmount, {
          target: { value: "50" },
        })
        expect(inputAmount.value).toBe("50")

        fireEvent.change(inputVAT, {
          target: { value: "70" },
        })
        expect(inputVAT.value).toBe( "70")

        fireEvent.change(inputPCT, {
          target: { value: "20" },
        })
        expect(inputPCT.value).toBe("20")

        fireEvent.change(inputCommentary, {
          target: { value: "blabla" },
        })
        expect(inputCommentary.value).toBe("blabla")

        userEvent.upload(inputFile, new File(['test'], 'test.png', { type: 'image/png' }))
        expect(inputFile.files[0].name).toBe('test.png');
        expect(inputFile.files).toHaveLength(1)
      })
      test("Then it fails with a 404 message error", async () => {
        const html = BillsUI({ error: 'Erreur 404' })
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      })
      test("Then it fails with a 500 message error", async () => {
        const html = BillsUI({ error: 'Erreur 500' })
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      })
    })
  })
})