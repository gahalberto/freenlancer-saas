import NewStoreForm from "@/components/stores/NewStoreForm";
import { CCol, CRow } from "@coreui/react-pro";

const CreateStoresPage = () => {
    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <NewStoreForm />
                </CCol>
            </CRow>
        </>
    )
}

export default CreateStoresPage;