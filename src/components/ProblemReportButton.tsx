'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, message, Radio, Space, Upload } from 'antd';
import { BugOutlined, UploadOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';

// Componente separado para garantir que o carregamento do cliente seja realizado corretamente
const ProblemReportButton: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [urlOption, setUrlOption] = useState('current');
  const [currentUrl, setCurrentUrl] = useState('');
  const [screenshot, setScreenshot] = useState<UploadFile | null>(null);

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
      
      // Prepara os dados do formulário
      const formData = new FormData();
      formData.append('userId', session.user.id);
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('url', reportUrl || '');
      
      // Adiciona o screenshot, se houver
      if (screenshot && screenshot.originFileObj) {
        formData.append('screenshot', screenshot.originFileObj as RcFile);
      }
      
      // Usando axios para fazer a requisição à API
      await axios.post('/api/problem-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
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

  const handleScreenshotChange = ({ fileList }: { fileList: UploadFile[] }) => {
    if (fileList.length > 0) {
      setScreenshot(fileList[fileList.length - 1]);
    } else {
      setScreenshot(null);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Você só pode fazer upload de imagens!');
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('A imagem deve ser menor que 2MB!');
    }
    
    return false; // Retorna false para impedir o upload automático
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

            <Form.Item
              label="Screenshot (opcional)"
              name="screenshot"
            >
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={beforeUpload}
                onChange={handleScreenshotChange}
                fileList={screenshot ? [screenshot] : []}
              >
                <Button icon={<UploadOutlined />}>Selecione uma imagem</Button>
              </Upload>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                Envie uma captura de tela do problema (máximo 2MB)
              </div>
            </Form.Item>

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