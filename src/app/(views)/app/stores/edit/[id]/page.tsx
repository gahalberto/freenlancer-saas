'use client'

import { getStoreById } from '@/app/_actions/stores/getStoreById'
import EditStoreForm from '@/components/stores/editStoreForm'
import { Stores } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const EditStorePage = ({ params }: { params: { id: string } }) => {
  const [storeData, setStoreData] = useState<Stores | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await getStoreById(params.id)
        setStoreData(data)
      } catch (error) {
        console.error('Erro ao buscar o estabelecimento:', error)
        router.push('/app/stores')
      }
    }

    fetchStore()
  }, [params.id, router])

  if (!storeData) {
    return <p>Carregando...</p>
  }

  // Adapta os dados antes de passar ao EditStoreForm
  const adaptedStoreData = {
    ...storeData,
    isAutomated: storeData.isAutomated ?? false, // Garante um boolean
    isMashguiach: storeData.isMashguiach ?? false, // Garante um boolean
    mashguiachId: storeData.mashguiachId ?? undefined, // Alinha com o tipo opcional
  }

  return (
    <div>
      <EditStoreForm storeData={adaptedStoreData} />
    </div>
  )
}

export default EditStorePage
