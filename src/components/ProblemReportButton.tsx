'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, message, Radio, Space } from 'antd';
import { BugOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import axios from 'axios';

// Componente separado para garantir que o carregamento do cliente seja realizado corretamente
const ProblemReportButton: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [urlOption, setUrlOption] = useState('current');
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Captura a URL atual quando o componente é montado
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
    // Atualiza a URL atual sempre que o modal é aberto
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
    // Redefine o formulário com valores iniciais
    form.setFieldsValue({
      urlOption: 'current',
      customUrl: '',
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: { 
    title: string; 
    description: string;
    urlOption: string;
    customUrl?: string;
  }) => {
    try {
      if (!session?.user?.id) {
        message.error('Você precisa estar logado para reportar um problema');
        return;
      }

      // Determina a URL a ser enviada
      const reportUrl = values.urlOption === 'current' ? currentUrl : values.customUrl;

      setLoading(true);
      
      // Usando axios para fazer a requisição à API
      await axios.post('/api/problem-report', {
        userId: session.user.id,
        title: values.title,
        description: values.description,
        url: reportUrl,
      });

      setLoading(false);
      message.success('Problema reportado com sucesso!');
      handleCancel();
    } catch (error) {
      setLoading(false);
      message.error('Erro ao reportar o problema. Tente novamente.');
    }
  };

  const handleUrlOptionChange = (e: any) => {
    setUrlOption(e.target.value);
  };

  return (
    <>
      <Button
        type="primary"
        icon={<BugOutlined />}
        size="small"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          borderRadius: '20px',
          padding: '5px 15px',
        }}
        onClick={showModal}
      >
        Reportar Problema
      </Button>
      
      {isModalVisible && (
        <Modal
          title="Relatar Problema"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ urlOption: 'current' }}
          >
            <Form.Item
              name="title"
              label="Título"
              rules={[{ required: true, message: 'Por favor, insira um título' }]}
            >
              <Input placeholder="Descreva brevemente o problema" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Descrição"
              rules={[{ required: true, message: 'Por favor, descreva o problema' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Descreva detalhadamente o problema encontrado"
              />
            </Form.Item>

            <Form.Item 
              label="Onde você encontrou o problema?"
              name="urlOption"
            >
              <Radio.Group onChange={handleUrlOptionChange} value={urlOption}>
                <Space direction="vertical">
                  <Radio value="current">
                    Página atual: 
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                      {currentUrl}
                    </span>
                  </Radio>
                  <Radio value="custom">Outra página</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {urlOption === 'custom' && (
              <Form.Item
                name="customUrl"
                label="URL da página"
                rules={[{ required: true, message: 'Por favor, insira a URL onde encontrou o problema' }]}
              >
                <Input placeholder="Ex: https://seusite.com/pagina-com-problema" />
              </Form.Item>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Enviar Relatório
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default ProblemReportButton; 