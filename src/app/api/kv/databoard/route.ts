import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { successResponse, getKVData } from '@/utils/api';

const allValueType = ['hash', 'list', 'set', 'zset', 'string'];

export async function GET() {
  const keys = await kv.keys('');
  const data = await Promise.all(keys.map(async key => {
    return await getKVData(key);
  }));

  const type = data.reduce((acc: any, cur) => {
    if (!cur) {
      return acc;
    }
    const { type } = cur;
    if (allValueType.includes(type)) {
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {});

  const result = {
    total: keys.length,
    ...type,
  };

  const response = NextResponse.json(successResponse(result));

  return response;
}

export const revalidate = 0;