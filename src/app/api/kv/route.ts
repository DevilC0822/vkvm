import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { successResponse, errorResponse, getKVData, addKVData } from '@/utils/api';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json(errorResponse('Key 不能为空'));
  }

  const data = await getKVData(key);
  return NextResponse.json(successResponse(data));
}

export async function POST(req: Request) {
  const { key, value, type = 'string' } = await req.json();
  const error = await addKVData(key, value, type);
  if (error) {
    return NextResponse.json(errorResponse(error));
  }
  return NextResponse.json(successResponse('添加成功'));
}

export async function PUT(req: Request) {
  const { key, value, type } = await req.json();
  await kv.del(key);
  const error = await addKVData(key, value, type);
  if (error) {
    return NextResponse.json(errorResponse(error));
  }
  return NextResponse.json(successResponse('更新成功'));
}

export async function DELETE(req: Request) {
  const { key } = await req.json();
  if (!key) {
    return NextResponse.json(errorResponse('Key 不能为空'));
  }
  if (Array.isArray(key)) {
    if (key.length === 0) {
      return NextResponse.json(errorResponse('Key 不能为空数组'));
    }
    await Promise.all(key.map(k => kv.del(k)));
    return NextResponse.json(successResponse(null, '删除成功'));
  }
  await kv.del(key);
  return NextResponse.json(successResponse(null, '删除成功'));
}

export const revalidate = 0;