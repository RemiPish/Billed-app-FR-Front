/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      const html = NewBillUI()
      document.body.innerHTML = html

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      const activeIcon = mailIcon.classList.contains('active-icon')
      expect(activeIcon).toBeTruthy();

    })
  })
})
