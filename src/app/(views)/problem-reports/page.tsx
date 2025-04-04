'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Input,
  message,
  Card,
  Typography,
  Tooltip,
  Avatar,
  Divider,
  Image,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
}

interface ProblemReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  url?: string;
  screenshotUrl?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  response?: string;
}

const statusColors = {
  PENDING: 'gold',
  IN_PROGRESS: 'blue',
  RESOLVED: 'green',
  CLOSED: 'red',
};

const statusIcons = {
  PENDING: <ClockCircleOutlined />,
  IN_PROGRESS: <SyncOutlined spin />,
  RESOLVED: <CheckCircleOutlined />,
  CLOSED: <CloseCircleOutlined />,
};

const statusLabels = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Progresso',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
};

const ProblemReportsPage: React.FC = () => {
  const { data: session } = useSession();
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState<ProblemReport | null>(null);
  const [form] = Form.useForm();
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/problem-report/list');
      setReports(data);
    } catch (error) {
      message.error('Erro ao carregar os relatórios de problemas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, status: string) => {
    try {
      await axios.put(`/api/problem-report/${reportId}`, { status });
      message.success('Status atualizado com sucesso');
      fetchReports();
    } catch (error) {
      message.error('Erro ao atualizar o status');
      console.error(error);
    }
  };

  const handleDelete = async (reportId: string) => {
    Modal.confirm({
      title: 'Tem certeza que deseja excluir este relatório?',
      content: 'Esta ação não pode ser desfeita.',
      okText: 'Sim',
      okType: 'danger',
      cancelText: 'Não',
      async onOk() {
        try {
          await axios.delete(`/api/problem-report/${reportId}`);
          message.success('Relatório excluído com sucesso');
          fetchReports();
        } catch (error) {
          message.error('Erro ao excluir o relatório');
          console.error(error);
        }
      },
    });
  };

  const showEditModal = (report: ProblemReport) => {
    setCurrentReport(report);
    form.setFieldsValue({
      status: report.status,
      response: report.response || '',
    });
    setResponse(report.response || '');
    setEditModalVisible(true);
  };

  const showDetailModal = (report: ProblemReport) => {
    setCurrentReport(report);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (currentReport) {
        await axios.put(`/api/problem-report/${currentReport.id}`, {
          status: values.status,
          response: values.response,
        });
        message.success('Relatório atualizado com sucesso');
        setEditModalVisible(false);
        fetchReports();
      }
    } catch (error) {
      message.error('Erro ao atualizar o relatório');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Usuário',
      dataIndex: 'user',
      key: 'user',
      render: (user: User) => (
        <Space>
          <Avatar>{user.name.charAt(0)}</Avatar>
          <span>{user.name}</span>
        </Space>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag icon={statusIcons[status as keyof typeof statusIcons]} color={statusColors[status as keyof typeof statusColors]}>
          {statusLabels[status as keyof typeof statusLabels]}
        </Tag>
      ),
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString('pt-BR')}>
          {formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })}
        </Tooltip>
      ),
    },
    {
      title: 'Ações',
      key: 'action',
      render: (_: any, record: ProblemReport) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => showDetailModal(record)}
            size="small"
          >
            Ver
          </Button>
          <Button 
            type="default" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            size="small"
          >
            Editar
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            Excluir
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <Title level={2}>Relatórios de Problemas</Title>
        <Paragraph>
          Gerencie os relatórios de problemas enviados pelos usuários. Você pode visualizar detalhes, atualizar o status ou excluir relatórios.
        </Paragraph>
        <Divider />

        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Edição */}
      <Modal
        title="Editar Relatório de Problema"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Salvar
          </Button>,
        ]}
        width={700}
      >
        {currentReport && (
          <Form form={form} layout="vertical">
            <Form.Item label="Título" className="mb-2">
              <Input value={currentReport.title} disabled />
            </Form.Item>
            
            <Form.Item label="Descrição" className="mb-2">
              <TextArea rows={4} value={currentReport.description} disabled />
            </Form.Item>
            
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Selecione um status' }]}
            >
              <Select>
                <Option value="PENDING">Pendente</Option>
                <Option value="IN_PROGRESS">Em Progresso</Option>
                <Option value="RESOLVED">Resolvido</Option>
                <Option value="CLOSED">Fechado</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="response"
              label="Resposta"
            >
              <TextArea 
                rows={6} 
                placeholder="Digite uma resposta para o usuário"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Modal de Detalhes */}
      <Modal
        title="Detalhes do Relatório"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Fechar
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            setDetailModalVisible(false);
            if (currentReport) showEditModal(currentReport);
          }}>
            Editar
          </Button>,
        ]}
        width={800}
      >
        {currentReport && (
          <div>
            <div className="mb-4">
              <Space align="center" className="mb-2">
                <Avatar size="large">{currentReport.user.name.charAt(0)}</Avatar>
                <div>
                  <Text strong>{currentReport.user.name}</Text>
                  <br />
                  <Text type="secondary">{currentReport.user.email}</Text>
                </div>
              </Space>
              <Tag 
                icon={statusIcons[currentReport.status as keyof typeof statusIcons]} 
                color={statusColors[currentReport.status as keyof typeof statusColors]}
                className="ml-2"
              >
                {statusLabels[currentReport.status as keyof typeof statusLabels]}
              </Tag>
            </div>

            <Divider />
            
            <Title level={4}>{currentReport.title}</Title>
            
            <Paragraph className="whitespace-pre-line mb-4">
              {currentReport.description}
            </Paragraph>
            
            {currentReport.url && (
              <div className="mb-4">
                <Text strong>URL:</Text> <a href={currentReport.url} target="_blank" rel="noopener noreferrer">{currentReport.url}</a>
              </div>
            )}
            
            {currentReport.screenshotUrl && (
              <div className="mb-4">
                <Text strong className="block mb-2">Screenshot:</Text>
                <Image
                  src={currentReport.screenshotUrl}
                  alt="Screenshot do problema"
                  width={600}
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}
            
            <div className="mb-4">
              <Text type="secondary">
                Criado em: {new Date(currentReport.createdAt).toLocaleString('pt-BR')}
              </Text>
              <br />
              <Text type="secondary">
                Última atualização: {new Date(currentReport.updatedAt).toLocaleString('pt-BR')}
              </Text>
            </div>
            
            {currentReport.response && (
              <>
                <Divider />
                <Title level={5}>Resposta:</Title>
                <Paragraph className="whitespace-pre-line">
                  {currentReport.response}
                </Paragraph>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProblemReportsPage; 