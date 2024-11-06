import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { CButton, CCard, CCardBody, CCardHeader, CCardText, CCol, CFooter, CRow } from "@coreui/react-pro";
import { getServerSession } from "next-auth";
import { subWeeks, addWeeks } from "date-fns"

const RelatoriosPage = async () => {
    const session = await getServerSession(authOptions);

    const twoWeeksAgo = subWeeks(new Date(), 2)
    const twoWeeksAhead = addWeeks(new Date(), 2)

    // Busca os eventos de serviço que envolvem o usuário e estão dentro desse intervalo de tempo
    const eventsServices = await db.eventsServices.findMany({
        where: {
            arriveMashguiachTime: {
                gte: twoWeeksAgo, // Data de chegada maior ou igual a 2 semanas atrás
                lte: twoWeeksAhead, // Data de chegada menor ou igual a 2 semanas no futuro
            },
        },
        include: {
            StoreEvents: true, // Inclui os eventos relacionados para obter o storeId
        },
    })

    const storeIds = eventsServices.map(eventService => eventService.StoreEvents.storeId)

    const storesWorking = await db.eventsServices.findMany({
        where: {
            StoreEvents: {
                storeId: { in: storeIds }  // Filtrando pelos IDs das lojas
            }
        },
        include: {
            StoreEvents: true
        }
    });


    const storeList = [];

    for (let store of storesWorking) {
        storeList.push(store.StoreEvents.storeId);  // Armazena os storeId corretamente
    }
    
    console.log(`Lojas trabalhando: ${storesWorking
        }`)

    const reports = await db.reports.findMany({
        where: {
            storeId: { in: storeList },
            
        }
    })

    return (
        <>
            <p>Os relátorios só serão apresentados relatórios das cozinhas que você estava ou estará trabalhando dentro de 30 dias.</p>

            <CRow className="g-3"> {/* Usamos g-3 para espaçamento entre os cartões */}
                {reports.map((report, index) => (
                    <CCol lg={4} md={6} sm={12} key={index}> {/* 3 colunas em telas grandes, 2 colunas em telas médias, 1 coluna em telas pequenas */}
                        <CCard textBgColor={'primary'} className="mb-3" style={{ maxWidth: '100%' }}>
                            <CCardHeader>{report.title}</CCardHeader>
                            <CCardBody>
                                <CCardText>
                                    {report.description}
                                </CCardText>
                            </CCardBody>
                        </CCard>
                    </CCol>
                ))}
            </CRow>
        </>
    )
}

export default RelatoriosPage;
