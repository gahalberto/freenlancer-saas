import ProfileForm from "@/components/profile/ProfileForm"
import { CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CRow } from "@coreui/react-pro"

type ParamsItems = {
    params: {
        id: string
    }
}

const ProfilePage = ({ params }: ParamsItems) => {
    return (
        <>
            <CRow>
                <CCol xs={12}>
                <ProfileForm userId={params.id} />
                </CCol>
            </CRow>
        </>
    )
}

export default ProfilePage;