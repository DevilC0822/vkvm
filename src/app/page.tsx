'use client';
import { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { ClusterOutlined, BorderlessTableOutlined, MenuOutlined, UnorderedListOutlined, OrderedListOutlined, StrikethroughOutlined } from '@ant-design/icons';
import service from '@/service';

const stats = [
  { name: 'Key Total', stat: 0, dataIndex: 'total', icon: ClusterOutlined },
  { name: 'hash Key', stat: 0, dataIndex: 'hash', icon: BorderlessTableOutlined },
  { name: 'list Key', stat: 0, dataIndex: 'list', icon: MenuOutlined },
  { name: 'set Key', stat: 0, dataIndex: 'set', icon: UnorderedListOutlined },
  { name: 'zset Key', stat: 0, dataIndex: 'zset', icon: OrderedListOutlined },
  { name: 'string Key', stat: 0, dataIndex: 'string', icon: StrikethroughOutlined },
];

export default function DataBoard() {
  const [data, setData] = useState(stats);
  const [loading, setLoading] = useState(true);
  const getKVDataboard = async () => {
    setLoading(true);
    const response = await service<any[]>('/api/kv/databoard');
    setLoading(false);
    if (!response.success) {
      return;
    }
    const data = stats.map(item => {
      return {
        ...item,
        stat: response.data?.[item.dataIndex as any] ?? 0,
      };
    });
    setData(data);
  };
  useEffect(() => {
    getKVDataboard();
  }, []);
  return (
    <div>
    <h3 className="text-base font-semibold leading-6 text-gray-900">DataBoard</h3>
    <dl className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {data.map(item => (
        <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
          <Skeleton loading={loading} active round title={false}>
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon aria-hidden="true" style={{ fontSize: 20, color: '#fff' }} />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd>
              <p className="ml-16 text-2xl font-semibold text-gray-900">{item?.stat}</p>
            </dd>
          </Skeleton>
        </div>
      ))}
    </dl>
  </div>
  );
}
