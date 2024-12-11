'use client'

import { getStoreById } from '@/app/_actions/stores/getStoreById'
import EditStoreForm from '@/components/stores/editStoreForm'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const EditStorePage = ({ params }: { params: { id: string } }) => {
  const [storeData, setStoreData] = useState<null | {
    id: string
    title: string
    address_zipcode: string
    address_street: string
    address_number: string
    address_neighbor: string
    address_city: string
    address_state: string
    userId: string
    isAutomated: boolean | null
    isMashguiach: boolean | null
    mashguiachId: string | null
    storeTypeId: string
  }>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await getStoreById(params.id) // Busca os dados do estabelecimento
        setStoreData(data)
      } catch (error) {
        console.error('Erro ao buscar o estabelecimento:', error)
        //  router.push('/app/stores') // Redireciona caso não encontre o estabelecimento
      }
    }

    fetchStore()
  }, [params.id, router])

  if (!storeData) {
    return <p>Carregando...</p>
  }

  return (
    <div>
      <EditStoreForm storeData={storeData} />
    </div>
  )
}

export default EditStorePage
