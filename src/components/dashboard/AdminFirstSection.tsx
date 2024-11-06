import { getMashguiachCount } from '@/app/_actions/dashboards/getMashguiachCount';
import { getStoreCount } from '@/app/_actions/dashboards/getStoreCount';
import { getEventsToAproveCount } from '@/app/_actions/events/getEventsToAproveCount';
import { cilBurger, cilUser, cilWarning } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CCol, CRow, CWidgetStatsC } from '@coreui/react-pro';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const AdminFirstSection = () => {
    const [qtdMashguiach, setQtdMashguiach] = useState<number | null>(null);
    const [qtdEstabelecimentos, setQtdEstabelecimentos] = useState<number | null>(null);
    const [eventToAprove, setEventToAprove] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const mashguiachCount = await getMashguiachCount();
                setQtdMashguiach(mashguiachCount);

                const estabelecimentosCount = await getStoreCount();
                setQtdEstabelecimentos(estabelecimentosCount);

                const eventsToAprove = await getEventsToAproveCount();
                setEventToAprove(eventsToAprove);

            } catch (error) {
                console.error('Erro ao buscar as quantidades:', error);
            } finally {
                setLoading(false); // Finaliza o estado de carregamento
            }
        };

        fetchCounts();
    }, []);

    if (loading) {
        return <p>Carregando...</p>; // Indica que os dados estão carregando
    }

    return (
        <>
            <CRow>
                <CCol xs={12} md={6} lg={3}>
                    <CWidgetStatsC
                        className="mb-3"
                        icon={<CIcon icon={cilUser} height={36} />}
                        color="primary"
                        inverse
                        progress={{ value: qtdMashguiach !== null ? (qtdMashguiach / 100) * 100 : 0 }} // Progresso baseado em qtdMashguiach
                        title="Qtd. de Mashguichim"
                        value={qtdMashguiach !== null ? qtdMashguiach : '0'}
                    />
                </CCol>

                <CCol xs={12} md={6} lg={3}>
                    <CWidgetStatsC
                        className="mb-3"
                        icon={<CIcon icon={cilBurger} height={36} />}
                        color="danger"
                        inverse
                        progress={{ value: qtdEstabelecimentos !== null ? (qtdEstabelecimentos / 100) * 100 : 0 }} // Progresso baseado em qtdEstabelecimentos
                        title="Qtd. de Estabelecimentos"
                        value={qtdEstabelecimentos !== null ? qtdEstabelecimentos : '0'}
                    />
                </CCol>


                <CCol xs={12} md={6} lg={3}>
                    <Link href={`/admin/events`}>
                        <CWidgetStatsC
                            className="mb-3"
                            icon={<CIcon icon={cilWarning} height={36} />}
                            color="secondary"
                            inverse
                            progress={{ value: eventToAprove !== null ? (eventToAprove / 100) * 100 : 0 }} // Progresso baseado em qtdEstabelecimentos
                            title="Eventos p/ liberar"
                            value={eventToAprove !== null ? eventToAprove : '0'}
                        />
                    </Link>
                </CCol>


            </CRow>


        </>
    );
};

export default AdminFirstSection;
