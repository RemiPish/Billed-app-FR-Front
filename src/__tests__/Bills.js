/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //console.log(document.body.innerHTML)
      //screen.debug(windowIcon)
      const activeIcon = windowIcon.classList.contains('active-icon')
      expect(activeIcon).toBeTruthy();

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I am on Bills Page and I click on the eye icon", () => {
    test("Then it should open the image modal", () => {
      
      document.body.innerHTML = BillsUI({ data: bills })
      let testBills = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });

      let iconEye = document.querySelector('div[data-testid="icon-eye"]');
      const imageModal = document.getElementById('modaleFile');

      const handleClickIconEyeTest = jest.fn(() =>
        testBills.handleClickIconEye(iconEye)
      );
      $.fn.modal = jest.fn();

      iconEye.addEventListener('click', handleClickIconEyeTest);
      userEvent.click(iconEye);

      expect(handleClickIconEyeTest).toBeCalled();
      expect(imageModal).toBeTruthy();
    })
  })
  
  describe("when I click on the New Bill button", () => {
    test("The New bill page should appear", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      let testBills = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });
      const handleClickNewBillTest = jest.fn(() => testBills.handleClickNewBill());
      const newBillButton = document.querySelector('button[data-testid="btn-new-bill"]');

      newBillButton.addEventListener('click', handleClickNewBillTest);
      userEvent.click(newBillButton);

      //console.log(document.body.innerHTML)
      const newBillTitle = screen.getAllByText("Envoyer une note de frais");
      const formNewBill = screen.getByTestId("form-new-bill")
      
      expect(handleClickNewBillTest).toBeCalled();
      expect(newBillTitle).toBeTruthy();
      expect(formNewBill).toBeTruthy();
    });
  })

  // test d'intégration GET
  describe("When I navigate to Bills Page", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee', email: 'a@a'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
    });
    test("fetches bills from mock API GET", async () => {

      window.onNavigate(ROUTES_PATH.Bills);
      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });
      bills.getBills().then(async (data) => {
        root.innerHTML = BillsUI({ data });
        await waitFor(() => screen.getByText("Mes notes de frais"));
        const table = screen.getByTestId("tbody");
  
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        expect(table.querySelectorAll("tr").length).toBe(4);
      });   
    })
  })

  describe("When an error occurs on API", () => {
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


