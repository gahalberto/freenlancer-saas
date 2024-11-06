import React, { useEffect, useState } from 'react';
import {
  CBadge,
  CButton,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react-pro';
import CIcon from '@coreui/icons-react';
import { cilBell, cilPlus, cilUserUnfollow } from '@coreui/icons';
import { useSession } from 'next-auth/react';
import { getNotifications } from '@/app/_actions/notifications/getNotifications';
import { markNotificationAsRead } from '@/app/_actions/notifications/markNotificationAsRead';

// Definindo o tipo de uma notificação
interface Notification {
  id: number;
  message: string;
  redirectUrl: string | null;
  createdAt: Date;
  readBy: string[];
  userId: string | null;
  read: boolean;
}

const AppHeaderDropdownNotif = () => {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]); // Definindo o tipo do estado corretamente
  const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento
  const [error, setError] = useState<string | null>(null); // Estado para lidar com erros
  const userId = session?.user?.id;

  // Função para buscar notificações
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    if (session?.user?.id) {
      try {
        const response = await getNotifications(session.user.id);
        // Se 'response' for false, atribui um array vazio
        setNotifications(response || []); // Atualiza o estado com as notificações ou array vazio
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        setError('Erro ao buscar notificações');
      } finally {
        setLoading(false); // Finaliza o estado de carregamento
      }
    }
  };

  useEffect(() => {
    fetchNotifications(); // Chama a função para buscar notificações
  }, [session]);

  const itemsCount = notifications.length; // Contagem de notificações

  const handleMarkAsRead = async (id: number) => {
    setError(null); // Limpa erros anteriores
    if (userId) {
      try {
        await markNotificationAsRead(id, userId);
        fetchNotifications(); // Atualiza notificações após marcar como lida
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        setError('Erro ao marcar notificação como lida');
      }
    }
  };

  // Marcar todas as notificações como lidas
  const handleReadAll = async () => {
    if (userId) {
      try {
        // Marca todas as notificações em paralelo
        await Promise.all(
          notifications.map((notification) =>
            markNotificationAsRead(notification.id, userId)
          )
        );
        fetchNotifications(); // Atualiza as notificações após marcar todas como lidas
      } catch (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        setError('Erro ao marcar todas como lidas');
      }
    }
  };

  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle caret={false}>
        <CIcon icon={cilBell} size="lg" className="my-1 mx-2" />
        <CBadge
          shape="rounded-pill"
          color="danger-gradient"
          className="position-absolute top-0 end-0"
        >
          {itemsCount}
        </CBadge>
      </CDropdownToggle>
      {/* Limitar o tamanho da visualização das notificações */}
      <CDropdownMenu className="pt-0" style={{ maxHeight: '400px', maxWidth: '700px', overflowY: 'auto' }}>
        <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold rounded-top mb-2">
          Você tem {itemsCount} {itemsCount === 1 ? 'notificação' : 'notificações'}
          <CButton onClick={handleReadAll} size='sm' color="warning" variant="ghost" className='ml-3' >
            Ler tudo
          </CButton>
        </CDropdownHeader>

        {/* Exibe estado de carregamento */}
        {loading ? (
          <CDropdownItem>Carregando...</CDropdownItem>
        ) : error ? (
          <CDropdownItem className="text-danger">{error}</CDropdownItem>
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <CDropdownItem
              key={item.id}
              onClick={() => handleMarkAsRead(item.id)}
              style={{ whiteSpace: 'normal', wordWrap: 'break-word' }} // Permitir quebra de linha e palavras longas
            >
              <CIcon icon={cilPlus} className="me-2 text-success" />
              {item.message}
            </CDropdownItem>
          ))
        ) : (
          <CDropdownItem>
            <CIcon icon={cilUserUnfollow} className="me-2 text-danger" /> Sem notificações
          </CDropdownItem>
        )}
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdownNotif;
