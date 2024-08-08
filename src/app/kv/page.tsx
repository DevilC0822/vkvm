'use client';
import React, { useState, useEffect } from 'react';
import { Button, Table, Divider, Modal, message, Form, Input, Select, Row, Col } from 'antd';
import type { TableColumnsType, FormProps } from 'antd';
import { getToolTipText, formatUrl } from '@/utils';
import Operate from './Operate';
import Filter from '@/components/Filter';
import service from '@/service';
import 'react18-json-view/src/style.css';

const { confirm } = Modal;

const selectOptions = [
  {
    label: 'All',
    value: '',
  },
  {
    label: 'String',
    value: 'string',
  },
  {
    label: 'Hash',
    value: 'hash',
  },
  {
    label: 'List',
    value: 'list',
  },
  {
    label: 'Set',
    value: 'set',
  },
  {
    label: 'Zset',
    value: 'zset',
  },
];

export interface DataType {
  key: React.Key;
  value: string;
  type: string;
}

type FieldType = {
  key: React.Key;
  type: string;
};

const App: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<'add' | 'view' | 'edit'>('add');
  const [currentRow, setCurrentRow] = useState<DataType | null>(null);
  const [datasource, setDatasource] = useState<DataType[]>([]);
  const [selectedRows, setSelectedRows] = useState<DataType[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    size: 10,
    total: 0,
  });
  const [filterForm, setFilterForm] = useState<FieldType>({
    key: '',
    type: '',
  });
  const [form] = Form.useForm();

  const onPatchDelete = () => {
    confirm({
      title: 'Do you Want to delete these items?',
      async onOk() {
        const response = await service('/api/kv', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: selectedRows.map(row => row.key),
          }),
        });
        if (!response.success) {
          messageApi.error(response.msg);
          return;
        }
        setSelectedRows([]);
        getAllKV();
      },
    });
  };
  const onAdd = () => {
    setCurrentOperation('add');
    setCurrentRow(null);
    setOpen(true);
  };
  const onView = (row: DataType) => {
    setCurrentOperation('view');
    setCurrentRow(row);
    setOpen(true);
  };
  const onEdit = (row: DataType) => {
    setCurrentOperation('edit');
    setCurrentRow(row);
    setOpen(true);
  };
  const onDelete = async (row: DataType) => {
    confirm({
      title: 'Do you Want to delete this item?',
      async onOk() {
        const response = await service('/api/kv', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: row.key,
          }),
        });
        if (!response.success) {
          messageApi.error(response.msg);
          return;
        }
        getAllKV();
      },
    });
  };
  const getAllKV = async (inParams?: { page?: number; size?: number; key?: React.Key; type?: string }) => {
    const params = {
      page: inParams?.page ?? paginationInfo.page,
      size: inParams?.size ?? paginationInfo.size,
      key: inParams?.key ?? filterForm.key,
      type: inParams?.type ?? filterForm.type,
    };
    setLoading(true);
    const response = await service<{
      records: DataType[];
      total: number;
    }>(formatUrl('/api/kv/list', params));
    setLoading(false);
    if (!response.success) {
      return;
    }
    setDatasource(response.data!.records);
    setPaginationInfo({
      ...params,
      total: response.data!.total,
    });
  };
  const onAddSuccess = () => {
    setOpen(false);
    setLoading(true);
    setTimeout(() => {
      getAllKV();
    }, 1000);
  };
  const onValueChange: FormProps<FieldType>['onValuesChange'] = changedValues => {
    setFilterForm({
      ...filterForm,
      ...changedValues,
    });
  };

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    getAllKV({
      page: 1,
      size: paginationInfo.size,
      key: values.key,
      type: values.type,
    });
  };
  const onReset = () => {
    form.resetFields();
  };
  useEffect(() => {
    getAllKV();
  }, []);
  const rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: false,
      key: record.key,
    }),
  };
  const columns: TableColumnsType<DataType> = [
    {
      title: 'Key',
      dataIndex: 'key',
      width: 120,
      fixed: 'left',
      render: (text: string) => {
        return getToolTipText(text);
      },
    },
    {
      title: 'Type',
      width: 150,
      dataIndex: 'type',
      render: (text: string) => {
        return getToolTipText(text);
      },
    },
    {
      title: 'Value',
      width: 180,
      dataIndex: 'value',
      render: (text: string | object) => {
        if (typeof text === 'object') {
          return getToolTipText(JSON.stringify(text));
        }
        return getToolTipText(text);
      },
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      width: 150,
      render: (_text: string, record: DataType) => (
        <span>
          <a
            onClick={() => {
              onView(record);
            }}
          >
            view
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              onEdit(record);
            }}
          >
            edit
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              onDelete(record);
            }}
          >
            delete
          </a>
        </span>
      ),
    },
  ];
  return (
    <div>
      {contextHolder}
      <div className="md:flex-auto">
        <h1 className="text-base font-semibold leading-6 text-gray-900">Vercel KV</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your Vercel KV store, you can add, view, edit and delete key-value pairs.
        </p>
      </div>
      <div className="my-2 flex justify-between">
        {selectedRows.length > 0 && <Button onClick={onPatchDelete}>Delete selected</Button>}
        <div></div>
        <div className="flex justify-center items-center">
          <Filter hoverTitle="filter" nodeID="filter">
            <Form
              name="filter-form"
              form={form}
              initialValues={{
                key: '',
                type: '',
              }}
              onFinish={onFinish}
              onValuesChange={onValueChange}
              autoComplete="off"
            >
              <Row gutter={16} className='mt-6'>
                <Col span={6}>
                  <Form.Item<FieldType> label="Key" name="key">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item<FieldType> label="Type" name="type">
                    <Select options={selectOptions} />
                  </Form.Item>
                </Col>
                <Col span={12} className='text-right'>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button className='mr-2' type="primary" htmlType="submit">
                      Search
                    </Button>
                    <Button htmlType="button" onClick={onReset}>
                      Reset
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Filter>
          <Divider type="vertical" />
          <Button className="ml-2" type="primary" onClick={onAdd}>
            Add
          </Button>
        </div>
      </div>
      <div id="filter" className="my-2" />
      <Table
        loading={loading}
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        columns={columns}
        scroll={{ x: 600 }}
        dataSource={datasource}
        pagination={{
          current: paginationInfo.page,
          pageSize: paginationInfo.size,
          total: paginationInfo.total,
          showTotal: total => `Total ${total} items`,
          pageSizeOptions: [5, 10, 20, 50, 100],
          onChange: (page, size) => {
            setPaginationInfo({
              ...paginationInfo,
              page,
              size,
            });
            getAllKV({
              page,
              size,
            });
          },
        }}
      />
      <Modal
        title={currentOperation.charAt(0).toUpperCase() + currentOperation.slice(1)}
        destroyOnClose
        maskClosable={false}
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        footer={null}
      >
        <Operate
          type={currentOperation}
          data={currentRow}
          onAddSuccess={onAddSuccess}
          onClose={() => {
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default App;

