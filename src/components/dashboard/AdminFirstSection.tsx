import { getEntriesByDay, getExitByDay } from '@/app/_actions/banco-de-horas/getMashguiachEntriesCount'
import { getMashguiachCount } from '@/app/_actions/dashboards/getMashguiachCount'
import { getStoreCount } from '@/app/_actions/dashboards/getStoreCount'
import { getEventsToAproveCount } from '@/app/_actions/events/getEventsToAproveCount'
import { cilBurger, cilUser, cilWarning } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CBadge, CCard, CCardHeader, CCardTitle, CCol, CRow, CWidgetStatsC } from '@coreui/react-pro'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const AdminFirstSection = () => {
  const [qtdMashguiach, setQtdMashguiach] = useState<number | null>(null)
  const [qtdEstabelecimentos, setQtdEstabelecimentos] = useState<number | null>(null)
  const [eventToAprove, setEventToAprove] = useState<number | null>(null)
  const [entriesCount, setEntriesCount] = useState(0);
  const [exitCount, setExitCount] = useState(0);

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const mashguiachCount = await getMashguiachCount()
        setQtdMashguiach(mashguiachCount)
        
        const entryCount = await getEntriesByDay();
        setEntriesCount(entryCount);

        const exitCount = await getExitByDay();
        setExitCount(exitCount);

        const estabelecimentosCount = await getStoreCount()
        setQtdEstabelecimentos(estabelecimentosCount)

        const eventsToAprove = await getEventsToAproveCount()
        setEventToAprove(eventsToAprove)
      } catch (error) {
        console.error('Erro ao buscar as quantidades:', error)
      } finally {
        setLoading(false) // Finaliza o estado de carregamento
      }
    }

    fetchCounts()
  }, [])

  if (loading) {
    return <p>Carregando...</p> // Indica que os dados estão carregando
  }

  return (
    <>
            <CCard className="mb-3">
          <CCardHeader>
            <CCardTitle>
              <b>Dashboard</b>
            </CCardTitle>
          </CCardHeader>
        </CCard>

      <CRow className="g-3">
        {/* Widget 1: QTD. MASHGUIACHIM */}
        <CCol xs={12} sm={6} md={4} lg={4}>
          <Link href={`/app/admin/users`}>
            <CWidgetStatsC
              className="mb-3 h-100"
              icon={<CIcon icon={cilUser} height={36} />}
              color="secondary"
              inverse
              progress={{ value: qtdMashguiach !== null ? (qtdMashguiach / 100) * 100 : 0 }}
              title="QTD. MASHGUIACHIM"
              value={qtdMashguiach !== null ? qtdMashguiach : '0'}
            />
          </Link>
        </CCol>

        {/* Widget 2: QTD. ESTABELECIMENTOS */}
        <CCol xs={12} sm={6} md={4} lg={4}>
          <Link href={`/app/admin/estabelecimentos`}>
            <CWidgetStatsC
              className="mb-3 h-100"
              icon={<CIcon icon={cilBurger} height={36} />}
              color="secondary"
              inverse
              progress={{ value: qtdEstabelecimentos !== null ? (qtdEstabelecimentos / 100) * 100 : 0 }}
              title="QTD. ESTABELECIMENTOS"
              value={qtdEstabelecimentos !== null ? qtdEstabelecimentos : '0'}
            />
          </Link>
        </CCol>

        {/* Widget 3: EVENTOS PENDENTES */}
        <CCol xs={12} sm={6} md={4} lg={4}>
          <Link href={`/app/admin/events`}>
            <CWidgetStatsC
              className="mb-3 h-100"
              icon={<CIcon icon={cilWarning} height={36} />}
              color={`${eventToAprove ? `danger` : 'primary'}`}
              inverse
              progress={{ value: eventToAprove !== null ? (eventToAprove / 100) * 100 : 0 }}
              title="EVENTOS PENDENTES"
              value={eventToAprove !== null ? eventToAprove : '0'}
            />
          </Link>
        </CCol>

        {/* Widget 4: ENTRADAS */}
        <CCol xs={12} sm={6} md={4} lg={4}>
          <CWidgetStatsC
            className="mb-3 h-100"
            icon={<CIcon icon={cilWarning} height={36} />}
            color={`${eventToAprove ? `secondary` : 'primary'}`}
            inverse
            progress={{ value: eventToAprove !== null ? (eventToAprove / 100) * 100 : 0 }}
            title="ENTRADAS"
            value={entriesCount !== null ? entriesCount : '0'}
          />
        </CCol>

        {/* Widget 5: SAÍDAS REGISTRADAS */}
        <CCol xs={12} sm={6} md={4} lg={4}>
          <CWidgetStatsC
            className="mb-3 h-100"
            icon={<CIcon icon={cilWarning} height={36} />}
            color={`${eventToAprove ? `secondary` : 'primary'}`}
            inverse
            progress={{ value: eventToAprove !== null ? (eventToAprove / 100) * 100 : 0 }}
            title="SAÍDAS REGISTRADAS"
            value={exitCount !== null ? exitCount : '0'}
          />
        </CCol>
      </CRow>
    </>
  )
}

export default AdminFirstSection