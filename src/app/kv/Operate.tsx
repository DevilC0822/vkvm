'use client';
import { useEffect, useState } from 'react';
import { message, Button, Select, Form, Input } from 'antd';
import type { FormProps } from 'antd';
import type { DataType } from './page';
import JsonView from 'react18-json-view';
import service from '@/service';

type FieldType = {
  key: React.Key;
  type: string;
  value: string | object | any[];
};

const selectOptions = [
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

interface IProps {
  type: 'add' | 'view' | 'edit';
  data?: DataType | null;
  onClose: () => void;
  onAddSuccess?: () => void;
}

const getValue = (type: string) => {
  switch (type) {
    case 'hash':
      return { key1: 'value1', key2: 'value2' };
    case 'list':
      return ['team1', 'team2'];
    case 'set':
      return ['team1', 'team2'];
    case 'zset':
      return [
        { score: 0, member: 'team1' },
        { score: 1, member: 'team2' },
      ];
    default:
      return 'this is a string value';
  }
};
let jsonData: string | object | any[] = getValue('string');
const formatFormValue = (item: FieldType) => {
  if (item.type === 'hash') {
    try {
      if (typeof item.value !== 'object') {
        message.error('Value 类型错误');
        return false;
      }
      return {
        ...item,
        value: item.value,
      };
    } catch (error) {
      message.error('Value 类型错误');
      return false;
    }
  }
  if (['list', 'set', 'zset'].includes(item.type)) {
    try {
      if (!Array.isArray(item.value)) {
        message.error('Value 类型错误');
        return false;
      }
      return {
        ...item,
        value: item.value,
      };
    } catch (error) {
      message.error('Value 类型错误');
      return false;
    }
  }
  return item;
};
const descMap = {
  add: 'Add a new key-value pair',
  view: 'View key-value pair',
  edit: 'Edit key-value pair',
};
const Operate: React.FC<IProps> = props => {
  const { data = null, type } = props;
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { onClose = () => { }, onAddSuccess = () => { } } = props;
  const [formValue, setFormValue] = useState<FieldType>({
    key: data?.key || '',
    type: data?.type || 'string',
    value: data?.value || getValue('string'),
  });
  const onValueChange: FormProps<FieldType>['onValuesChange'] = changedValues => {
    setFormValue({
      ...formValue,
      ...changedValues,
    });
  };

  const onFinish: FormProps<FieldType>['onFinish'] = () => {
    if (!formValue.key) {
      messageApi.warning({
        content: 'Please input key',
      });
      return;
    }
    if (formValue.value === '') {
      messageApi.warning({
        content: 'Please input value',
      });
      return;
    }
    const params = formatFormValue(formValue);
    if (!params) {
      return;
    }
    setLoading(true);
    service('/api/kv', {
      method: type === 'add' ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then(res => {
        if (!res.success) {
          messageApi.error({
            content: res.msg,
          });
          return;
        }
        onAddSuccess();
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onSetExmapleValue = () => {
    jsonData = getValue(formValue.type);
    setFormValue({
      ...formValue,
      value: getValue(formValue.type),
    });
  };
  const onCancel = () => {
    onClose();
  };
  useEffect(() => {
    if (!data) {
      return;
    }
    jsonData = data.value;
    setFormValue(data);
  }, [data]);
  useEffect(() => {
    return () => {
      jsonData = getValue('string');
    };
  }, []);
  return (
    <div>
      {contextHolder}
      <p className="mt-2 mb-6 text-sm text-gray-500">{descMap[type]}</p>
      <Form
        name="basic"
        layout="vertical"
        labelCol={{ span: 2 }}
        initialValues={formValue}
        onFinish={onFinish}
        onValuesChange={onValueChange}
        autoComplete="off"
      >
        <Form.Item<FieldType> label="Key" name="key">
          <Input disabled={['view', 'edit'].includes(type)} />
        </Form.Item>

        <Form.Item<FieldType> label="Type" name="type">
          <Select disabled={['view', 'edit'].includes(type)} options={selectOptions} />
        </Form.Item>

        <Form.Item
          labelCol={{ span: 24 }}
          extra={
            ['add', 'edit'].includes(type) ?
              <Button type="link" onClick={onSetExmapleValue} style={{ paddingLeft: 0, paddingRight: 0 }}>
                Set example value
              </Button> : null
          }
          label="Value"
          name="value"
        >
          <div className="p-2 w-full border border-violet-500 bg-slate-100 rounded">
            <JsonView
              editable={{
                add: ['add', 'edit'].includes(type),
                edit: ['add', 'edit'].includes(type),
                delete: ['add', 'edit'].includes(type),
              }}
              onAdd={params => {
                jsonData = params.src[formValue.key as string],
                setFormValue({
                  ...formValue,
                  value: params.src[formValue.key as string],
                });
              }}
              onEdit={params => {
                jsonData = params.src[formValue.key as string],
                setFormValue({
                  ...formValue,
                  value: params.src[formValue.key as string],
                });
              }}
              onDelete={params => {
                jsonData = params.src[formValue.key as string],
                setFormValue({
                  ...formValue,
                  value: params.src[formValue.key as string],
                });
              }}
              src={{ [formValue.key as string]: jsonData }}
            />
          </div>
        </Form.Item>

        {['add', 'edit'].includes(type) && (
          <Form.Item style={{ marginBottom: 0 }}>
            <div className="flex flex-col gap-2">
              <Button type="primary" htmlType="submit" loading={loading}>
                {type === 'add' ? 'Add' : 'Edit'}
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </div>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default Operate;

