'use client'

import { getStoreById } from '@/app/_actions/stores/getStoreById'
import EditStoreForm from '@/components/stores/editStoreForm'
import MenuPdfViewer from '@/components/stores/menuPdfViewer'
import { Stores } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'

const EditStorePage = ({ params }: { params: { id: string } }) => {
  const [storeData, setStoreData] = useState<Stores | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()
  const fetchInProgress = useRef(false)

  // Usar useCallback para evitar recriação da função em cada render
  const fetchStore = useCallback(async () => {
    // Evitar requisições duplicadas
    if (fetchInProgress.current) {
      console.log('Fetch já em andamento, ignorando chamada duplicada');
      return;
    }

    try {
      fetchInProgress.current = true;
      console.log('Iniciando busca de estabelecimento');
      setLoading(true)
      const data = await getStoreById(params.id)
      setStoreData(data)
    } catch (error) {
      console.error('Erro ao buscar o estabelecimento:', error)
      router.push('/app/stores')
    } finally {
      setLoading(false)
      fetchInProgress.current = false;
      console.log('Busca de estabelecimento concluída');
    }
  }, [params.id, router])

  // Carregar dados apenas uma vez ao montar o componente
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted && !storeData) {
        await fetchStore();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchStore, storeData]);

  if (loading && !storeData) {
    return <p>Carregando...</p>
  }

  if (!storeData) {
    return <p>Estabelecimento não encontrado.</p>
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
      <MenuPdfViewer menuUrl={storeData.menuUrl} />
    </div>
  )
}

export default EditStorePage
