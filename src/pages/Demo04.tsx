import React from 'react'
import DemoStd from './DemoStd'
import DemoInbound from './DemoInbound'
import DemoOutbound from './DemoOutbound'
import DemoWh from './DemoWh'

const Demo04 = () => {
  return (
    <div className='font-thai'>
        <h1 className="text-2xl font-semibold mb-4">ทั้งหมด</h1>
        <DemoStd />
        <h1 className="text-2xl font-semibold mb-4">กทม. - ตจว.</h1>
        <DemoOutbound />
        <h1 className="text-2xl font-semibold mb-4">ตจว. - กทม.</h1>
        <DemoInbound />
        <h1 className="text-2xl font-semibold mb-4">ตจว. - ตจว.</h1>
        <DemoWh />
    </div>
  )
}

export default Demo04