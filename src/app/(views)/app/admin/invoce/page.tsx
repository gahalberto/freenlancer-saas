'use client'

import {
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilDollar, cilPrint, cilSave } from '@coreui/icons'

const Invoice = () => {
  const print = (e: any) => {
    e.preventDefault()
    window.print()
  }

  return (
    <CCard>
      <CCardHeader>
        Invoice <strong>#90-98792</strong>
        <CButton
          className="me-1 float-end"
          size="sm"
          color="secondary"
          onClick={print}
        >
          <CIcon icon={cilPrint} /> Print
        </CButton>
        <CButton className="me-1 float-end" size="sm" color="info">
          <CIcon icon={cilSave} /> Save
        </CButton>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-4">
          <CCol sm={4}>
            <h6 className="mb-3">De:</h6>
            <div>
              <strong>Beit Yaakov - Dep. Kashrut</strong>
            </div>
            <div>Rua Veiga Filho.</div>
            <div>São Paulo - SP</div>
            <div>Email: contato@byk.org.br</div>
            <div>Tel: +55 123-456-7890</div>
          </CCol>
          <CCol sm={4}>
            <h6 className="mb-3">To:</h6>
            <div>
              <strong>Acme Inc.</strong>
            </div>
            <div>159 Manor Station Road</div>
            <div>San Diego, CA 92154</div>
            <div>Email: email@acme.com</div>
            <div>Phone: +1 123-456-7890</div>
          </CCol>
          <CCol sm={4}>
            <h6 className="mb-3">Details:</h6>
            <div>
              Invoice <strong>#90-98792</strong>
            </div>
            <div>March 30, 2020</div>
            <div>VAT: EU9877281777</div>
            <div>Account Name: ACME</div>
            <div>
              <strong>SWIFT code: 99 8888 7777 6666 5555</strong>
            </div>
          </CCol>
        </CRow>
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="text-center">#</CTableHeaderCell>
              <CTableHeaderCell>Mashguiach</CTableHeaderCell>
              <CTableHeaderCell>Descrição</CTableHeaderCell>
              <CTableHeaderCell className="text-center">Total Horas:</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
          <CTableRow>
              <CTableDataCell className="text-center">1</CTableDataCell>
              <CTableDataCell className="text-start">Azriela</CTableDataCell>
              <CTableDataCell className="text-start">RoseWood</CTableDataCell>
              <CTableDataCell className="text-center">140</CTableDataCell>
              <CTableDataCell className="text-end">R$ 6000</CTableDataCell>
            </CTableRow>

            <CTableRow>
              <CTableDataCell className="text-center">2</CTableDataCell>
              <CTableDataCell className="text-start">Sarah Tsila</CTableDataCell>
              <CTableDataCell className="text-start">Padoka</CTableDataCell>
              <CTableDataCell className="text-center">140</CTableDataCell>
              <CTableDataCell className="text-end">R$ 7000</CTableDataCell>
            </CTableRow>


            <CTableRow>
              <CTableDataCell className="text-center">3</CTableDataCell>
              <CTableDataCell className="text-start">Suzi</CTableDataCell>
              <CTableDataCell className="text-start">RoseWood</CTableDataCell>
              <CTableDataCell className="text-center">140</CTableDataCell>
              <CTableDataCell className="text-end">R$ 6000</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
        <CRow>
          <CCol lg={4} sm={5}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </CCol>
          <CCol lg={4} sm={5} className="ms-auto">
            <CTable>
              <CTableBody>
                <CTableRow>
                  <CTableDataCell className="text-start">
                    <strong>Salário:</strong>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">R$6,000</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell className="text-start">
                    <strong>Total de horas:</strong>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">25</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell className="text-start">
                    <strong>R$ HORA:</strong>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">R$40,00</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell className="text-start">
                    <strong>Total</strong>
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <strong>R$6.000,36</strong>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>

          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default Invoice