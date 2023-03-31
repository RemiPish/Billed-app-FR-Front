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
import mockStore from "../__mocks__/store"
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

  describe("When I fill the form", () => {
    describe("When the file extension is not correct", () => {
      test("Then the file is not accepted", async () => {
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        const errorMessage = screen.getByTestId("wrong-extension");
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        const formFileInput = screen.getByTestId('file');
        formFileInput.addEventListener('change', handleChangeFile);


        fireEvent.change(formFileInput, {
          target: {
            files: [new File(['test.txt'], 'test.txt', {
              type: 'image/txt'
            })],
          }
        })

        expect(handleChangeFile).toHaveBeenCalled()
        expect(formFileInput.files[0].name).toBe('test.txt');

        const rightExtension = errorMessage.classList.contains('right-extension')
        const wrongExtension = errorMessage.classList.contains('wrong-extension')
        expect(wrongExtension).toBeTruthy();
        expect(rightExtension).toBeFalsy();
      })
    })
    describe("When the file extension is correct", () => {
      test("Then the file is accepted", async () => {
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        const errorMessage = screen.getByTestId("wrong-extension");
        const handleChangeFileJest = jest.fn((e) => newBill.handleChangeFile(e))
        const formFileInput = screen.getByTestId('file');
        formFileInput.addEventListener('change', handleChangeFileJest);


        fireEvent.change(formFileInput, {
          target: {
            files: [new File(['test.png'], 'test.png', {
              type: 'image/png'
            })],
          }
        })

        expect(handleChangeFileJest).toHaveBeenCalled()
        expect(formFileInput.files[0].name).toBe('test.png');

        const rightExtension = errorMessage.classList.contains('right-extension')
        const wrongExtension = errorMessage.classList.contains('wrong-extension')
        expect(wrongExtension).toBeFalsy();
        expect(rightExtension).toBeTruthy();
      })
      test("Then the form can be submitted", () => {
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        const handleSubmitJest = jest.fn((e) => newBill.handleSubmit(e))
        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", handleSubmitJest);


        const inputExpenseName = screen.getByTestId('expense-name')
        const inputExpenseType = screen.getByTestId('expense-type')
        const inputDatepicker = screen.getByTestId('datepicker')
        const inputAmount = screen.getByTestId('amount')
        const inputVAT = screen.getByTestId('vat')
        const inputPCT = screen.getByTestId('pct')
        const inputCommentary = screen.getByTestId('commentary')
        const formFileInput = screen.getByTestId('file');

        fireEvent.change(inputExpenseType, {
          target: { value: "Transports" },
        })
        expect(inputExpenseType.value).toBe("Transports")

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
        expect(inputVAT.value).toBe("70")

        fireEvent.change(inputPCT, {
          target: { value: "20" },
        })
        expect(inputPCT.value).toBe("20")

        fireEvent.change(inputCommentary, {
          target: { value: "blabla" },
        })

        fireEvent.change(formFileInput, {
          target: {
            files: [new File(['test.png'], 'test.png', {
              type: 'image/png'
            })],
          }
        })

        const submitBtn = document.getElementById('btn-send-bill');
        userEvent.click(submitBtn);

        expect(handleSubmitJest).toHaveBeenCalled();
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      })
    })
  })

  // test d'intégration POST
  describe("Given I am a user connected as Employee", () => {
    describe("When I add a new bill", () => {
      test("Then the new bill is added ", async () => {
        const billsSpy = jest.spyOn(mockStore, "bills");
        let newBill = {
          id : "dsfosdkfmlsdkvxck",
          email: "a@a",
          type: "Transports",
          name: "transports",
          amount: "50",
          date: "2023-03-31",
          vat: "70",
          pct: "20",
          commentary: "POST bill",
          fileUrl: "https://test.storage.tld/v0/b/test.jpg",
          fileName: "test.jpg",
          status: "pending",
        };

        
        let bills = await mockStore.bills().create(newBill)
        expect(billsSpy).toHaveBeenCalled();
        expect(bills.length).toBe(5)

      })
      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, 'bills')
          Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: 'a@a'
          }))
          const root = document.createElement('div')
          root.setAttribute('id', 'root')
          document.body.appendChild(root)
          router()
        })
        test("fetches bills from an API and fails with 404 message error", async () => {

          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 404"))
              }
            }
          })
          const errorHtml = BillsUI({ error: "Erreur 404" })
          document.body.innerHTML = errorHtml
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })

        test("fetches messages from an API and fails with 500 message error", async () => {

          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 500"))
              }
            }
          })

          const errorHtml = BillsUI({ error: "Erreur 500" })
          document.body.innerHTML = errorHtml
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
    })
  })
})