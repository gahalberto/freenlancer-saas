import React, { useState, useEffect } from 'react';
import { Input, message, Upload, Button as AntButton } from 'antd';
import { BugOutlined, UploadOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from 'antd';

// Componente cliente
const ClientProblemReportButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Efeito para garantir que o componente está montado
  useEffect(() => {
    setMounted(true);
    setCurrentUrl(window.location.href);
  }, []);

  const showDialog = () => {
    setOpen(true);
    form.resetFields();
    form.setFieldsValue({ url: currentUrl });
    setScreenshotFile(null);
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
    setScreenshotFile(null);
  };

  const handleSubmit = async (values: { 
    title: string; 
    description: string;
    url: string;
  }) => {
    try {
      if (!session?.user?.id) {
        message.error('Você precisa estar logado para reportar um problema');
        return;
      }

      setLoading(true);
      
      // Preparar dados para envio
      const formData = new FormData();
      formData.append('userId', session.user.id);
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('url', values.url || currentUrl);
      
      // Adicionar screenshot se existir
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }
      
      // Usando axios para fazer a requisição à API
      await axios.post('/api/problem-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);
      message.success('Problema reportado com sucesso!');
      handleCancel();
    } catch (error) {
      setLoading(false);
      message.error('Erro ao reportar o problema. Tente novamente.');
      console.error('Erro ao enviar relatório:', error);
    }
  };

  // Configurações para o upload de imagem
  const uploadProps = {
    beforeUpload: (file: File) => {
      // Verificar tipo de arquivo
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Você só pode fazer upload de arquivos de imagem!');
        return Upload.LIST_IGNORE;
      }
      
      // Verificar tamanho do arquivo (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('A imagem deve ser menor que 5MB!');
        return Upload.LIST_IGNORE;
      }
      
      setScreenshotFile(file);
      return false;
    },
    maxCount: 1,
  };

  // Retorna null se não estiver montado
  if (!mounted) {
    return null;
  }

  // Botão flutuante que ativa o diálogo
  const ReportButton = () => (
    <div className="fixed bottom-6 right-6 z-40">
      <AntButton 
        type="primary"
        shape="round"
        size="large"
        icon={<BugOutlined />}
        onClick={showDialog}
        className="shadow-lg flex items-center"
      >
        Reportar Problema
      </AntButton>
    </div>
  );

  return (
    <>
      <ReportButton />
      
      {mounted && (
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) handleCancel();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reportar Problema</DialogTitle>
            </DialogHeader>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="mt-4"
              initialValues={{
                url: currentUrl
              }}
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
                name="url"
                label="URL da página"
                extra="Você pode modificar o URL se o problema for em outra página"
              >
                <Input placeholder="https://exemplo.com/pagina" />
              </Form.Item>

              <Form.Item
                name="screenshot"
                label="Print da tela (opcional)"
                extra="Faça upload de uma imagem para ilustrar o problema (max: 5MB)"
              >
                <Upload 
                  {...uploadProps} 
                  listType="picture"
                  fileList={screenshotFile ? [
                    {
                      uid: '-1',
                      name: screenshotFile.name,
                      status: 'done',
                      url: URL.createObjectURL(screenshotFile),
                    } as any
                  ] : []}
                  onRemove={() => {
                    setScreenshotFile(null);
                    return true;
                  }}
                >
                  <AntButton icon={<UploadOutlined />}>
                    Selecionar imagem
                  </AntButton>
                </Upload>
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <AntButton onClick={handleCancel}>
                  Cancelar
                </AntButton>
                <AntButton 
                  type="primary" 
                  loading={loading}
                  onClick={() => form.submit()}
                >
                  Enviar Relatório
                </AntButton>
              </div>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ClientProblemReportButton; 