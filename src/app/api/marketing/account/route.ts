import { NextResponse } from 'next/server'
export async function GET() {
  const accounts = [
    { id: '1', type: 'douyin', nickname: '我的抖音', avatar: '', status: 1, uid: '123' },
    { id: '2', type: 'xhs', nickname: '我的小红书', avatar: '', status: 1, uid: '456' },
    { id: '3', type: 'bilibili', nickname: '我的B站', avatar: '', status: 1, uid: '789' },
    { id: '4', type: 'kwai', nickname: '我的快手', avatar: '', status: 1, uid: '101' },
  ]
  return NextResponse.json({ code: 0, data: accounts })
}