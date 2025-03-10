import React from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCardText,
  CListGroup,
  CListGroupItem,
  CPopover,
  CButton,
  CRow,
  CCol
} from '@coreui/react-pro';
import { CIcon } from '@coreui/icons-react';
import { cilInfo } from '@coreui/icons';

interface PriceCalculationInfoProps {
  dayHourValue: number;
  nightHourValue: number;
}

/**
 * Componente que exibe informações sobre como o sistema calcula os preços
 * dos serviços de Mashguiach com base nos horários diurnos e noturnos.
 */
const PriceCalculationInfo: React.FC<PriceCalculationInfoProps> = ({
  dayHourValue,
  nightHourValue
}) => {
  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CCardTitle>Como o preço é calculado</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CCardText>
          O sistema calcula automaticamente o preço total do serviço com base nos horários e valores por hora.
        </CCardText>

        <CRow className="mb-3">
          <CCol>
            <h6>Valores Atuais:</h6>
            <CListGroup flush>
              <CListGroupItem>
                <strong>Hora Diurna (06:00-22:00):</strong> R$ {dayHourValue.toFixed(2)}
              </CListGroupItem>
              <CListGroupItem>
                <strong>Hora Noturna (22:00-06:00):</strong> R$ {nightHourValue.toFixed(2)}
              </CListGroupItem>
            </CListGroup>
          </CCol>
        </CRow>

        <h6>Exemplo de Cálculo:</h6>
        <CCardText>
          Para um serviço das 20:00 às 23:00 com os valores atuais:
        </CCardText>
        <CListGroup flush className="mb-3">
          <CListGroupItem>
            <strong>Horas Diurnas:</strong> 2 horas (20:00-22:00) = 2 × R$ {dayHourValue.toFixed(2)} = R$ {(2 * dayHourValue).toFixed(2)}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Horas Noturnas:</strong> 1 hora (22:00-23:00) = 1 × R$ {nightHourValue.toFixed(2)} = R$ {(1 * nightHourValue).toFixed(2)}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Total:</strong> R$ {(2 * dayHourValue + 1 * nightHourValue).toFixed(2)}
          </CListGroupItem>
        </CListGroup>

        <CPopover
          content={
            <div>
              <p><strong>Algoritmo de Cálculo:</strong></p>
              <ol>
                <li>O período é dividido em intervalos de 15 minutos</li>
                <li>Cada intervalo é classificado como diurno ou noturno</li>
                <li>O sistema calcula o valor para cada tipo de hora</li>
                <li>O preço total é a soma dos valores diurnos e noturnos</li>
              </ol>
            </div>
          }
          placement="top"
          trigger="focus"
        >
          <CButton color="link" className="p-0">
            <CIcon icon={cilInfo} className="me-2" />
            Mais detalhes sobre o cálculo
          </CButton>
        </CPopover>
      </CCardBody>
    </CCard>
  );
};

export default PriceCalculationInfo; 