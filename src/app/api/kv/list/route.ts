import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { successResponse, getKVData, errorResponse } from '@/utils/api';

const allValueType = ['hash', 'list', 'set', 'zset', 'string'];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const searchKey = searchParams.get('key');
  const searchType = searchParams.get('type');
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  if (searchType && !allValueType.includes(searchType)) {
    return NextResponse.json(errorResponse('请输入正确的 type'));
  }
  const start = (Number(page) - 1) * Number(size);
  const end = start + Number(size);
  let keys = await kv.keys('');
  if (searchKey) {
    keys = keys.filter(key => key.includes(searchKey));
  }
  const data = await Promise.all(keys.map(async key => {
    return await getKVData(key, searchType);
  }));
  const result = data.filter(Boolean);
  result.sort((a, b) => a!.key.localeCompare(b!.key));
  return NextResponse.json(successResponse({
    records: data.filter(Boolean).slice(start, end),
    total: result.length,
  }));
}

export const revalidate = 0;