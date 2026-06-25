




import { type StockInHandListSchema } from '../data/schema'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'

import { useEffect, useState } from 'react'



interface StockInHandProps {
    data: StockInHandListSchema
}

export default function StockInHand({ data: stockInHandListSchema }: StockInHandProps) {

    return (


        <>
                {stockInHandListSchema.length === 0 ? (
                    <div className='text-center text-gray-500'>No data available.</div>
                ) : (
                    <ReportView
                        data={stockInHandListSchema} />
                )}
        </>



    )
}

const ReportView = ({ data }: StockInHandProps) => {

    return <div className='w-full min-h-full  grid grid-rows-[auto_1fr]'>
        <ReportHeader />
        <div className='border-2 min-h-full'>

            {data.map((item, index) => (
                <div key={index} className={cn
                    ('grid grid-cols-[1fr_2fr] text-center ', index % 2 === 0 ? 'bg-white' : 'bg-gray-100')
                }>
                    <div className=' text-left pl-2 font-semibold'>
                        <Link to={'/reports/stock_summary/stock-in-hand-item-wise'} className='inline-block mr-2 text-gray-500 hover:text-blue-700'
                        >
                            {item.itemName}
                        </Link>
                    </div>
                    <div className='grid grid-cols-4 '>

                        <div className='grid grid-cols-2'>
                            <div className='text-right pr-2'>
                                {item.openingQuantity === 0 ? '-' :
                                    `${item.openingQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                            </div>
                            <div>{item.openingAmount === 0 ? '-' : item.openingAmount?.toFixed(2)}</div>
                        </div>



                        <div className='grid grid-cols-2'>
                            <div className='text-right pr-2'>

                                {item.inwardQuantity === 0 ? '-' :
                                    `${item.inwardQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                            </div>
                            <div>{item.inwardAmount === 0 ? '-' : item.inwardAmount?.toFixed(2)}</div>
                        </div>



                        <div className='grid grid-cols-2'>
                            <div className='text-right pr-2'>

                                {item.outwardQuantity === 0 ? '-' :
                                    `${item.outwardQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                            </div>
                            <div>{item.outwardAmount === 0 ? '-' : item.outwardAmount?.toFixed(2)}</div>
                        </div>


                        <div className='grid grid-cols-2'>
                            <div className='text-right pr-2'>

                                {item.closingQuantity === 0 ? '-' :
                                    `${item.closingQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                            </div>
                            <div>{item.closingAmount === 0 ? '-' : item.closingAmount?.toFixed(2)}</div>
                        </div>




                    </div>
                </div>
            ))}
        </div>
        <ReportFooter data={data} />
    </div>
}

const ReportHeader = () => {
    return (
        <div className=' grid grid-cols-[1fr_2fr] border-amber-950! bg-gray-100  text-center font-bold  '>
            <div className='text-accent-foreground border-2 text-left pl-2 font-stretch-ultra-expanded  h-full flex items-center'>PARTICULARS</div>
            <div className='grid grid-cols-4 border-2 border-l-0'>
                <div className=''>
                    <div className='text-accent-foreground  border-b-2'>Opening</div>
                    <div className='grid grid-cols-2'>
                        <div>Qty</div>
                        <div className='border-l-2'>Val</div>
                    </div>
                </div>
                <div>
                    <div className='text-accent-foreground border-b-2 border-l-2   ' >Inward</div>
                    <div className='grid grid-cols-2'>
                        <div className='border-l-2'>Qty</div>
                        <div className='border-l-2'>Val</div>
                    </div>
                </div>

                <div>
                    <div className='text-accent-foreground border-b-2 border-l-2'>Outward</div>
                    <div className='grid grid-cols-2'>
                        <div className='border-l-2'>Qty</div>
                        <div className='border-l-2'>Val</div>
                    </div>
                </div>
                <div>
                    <div className='text-accent-foreground border-b-2 border-l-2'>Closing</div>
                    <div className='grid grid-cols-2'>
                        <div className='border-l-2'>Qty</div>
                        <div className='border-l-2'>Val</div>
                    </div>
                </div>



            </div>
        </div>
    )
}


const ReportFooter = ({ data }: StockInHandProps) => {
    const [unitCode, setUnitCode] = useState<string>('');
    const [noOfDecimalPlaces, setNoOfDecimalPlaces] = useState<number>(0);

    const total = {
        openingQuantity: 0,
        openingAmount: 0,
        inwardQuantity: 0,
        inwardAmount: 0,
        outwardQuantity: 0,
        outwardAmount: 0,
        closingQuantity: 0,
        closingAmount: 0,
        itemCount: 0,
    }


    data.forEach(item => {
        total.openingQuantity += item.openingQuantity ?? 0;
        total.openingAmount += item.openingAmount ?? 0;
        total.inwardQuantity += item.inwardQuantity ?? 0;
        total.inwardAmount += item.inwardAmount ?? 0;
        total.outwardQuantity += item.outwardQuantity ?? 0;
        total.outwardAmount += item.outwardAmount ?? 0;
        total.closingQuantity += item.closingQuantity ?? 0;
        total.closingAmount += item.closingAmount ?? 0;
        total.itemCount += 1;
    })

    useEffect(() => {
        const uniqueUnitCode = new Set<string>();
        const noOfDecimalPlaces = new Set<number>();
        data.forEach(item => {
            if (item.unitCode) {
                uniqueUnitCode.add(item.unitCode);
                noOfDecimalPlaces.add(item.noOfDecimalPlaces);
            }
        });
        const uniqueUnitCodeArray = Array.from(uniqueUnitCode);
        if (uniqueUnitCodeArray.length === 1) {
            setUnitCode('' + uniqueUnitCodeArray.join(', '));
            setNoOfDecimalPlaces(Array.from(noOfDecimalPlaces)[0]);
        } else {
            setUnitCode('~');
            setNoOfDecimalPlaces(2);
        }

    }, []);

    return (
        <div className=' grid grid-cols-[1fr_2fr] border-amber-950! bg-gray-100  text-center font-bold  '>
            <div className='text-accent-foreground border-2 text-right flex items-center pr-2 h-full justify-between'>
                <div className='pl-4 italic text-sm font-mono'>
                    Item count: {data.length}
                </div>
                <div>
                    Total:
                </div>
            </div>
            <div className='grid grid-cols-4 border-b-2 border-l-0'>
                <div className=''>
                    <div className='grid grid-cols-2'>
                        <div className=' text-right pr-2'>{total.openingQuantity === 0 ? '-' : (total.openingQuantity.toFixed(noOfDecimalPlaces) + ' ' + unitCode)}  </div>
                        <div className='border-l-2'>{total.openingAmount === 0 ? '-' : total.openingAmount}</div>
                    </div>
                </div>
                <div>
                    <div className='grid grid-cols-2'>
                        <div className='border-l-2  text-right pr-2'>{total.inwardQuantity === 0 ? '-' : (total.inwardQuantity.toFixed(noOfDecimalPlaces) + ' ' + unitCode)}</div>
                        <div className='border-l-2'>{total.inwardAmount === 0 ? '-' : total.inwardAmount}</div>
                    </div>
                </div>

                <div>
                    <div className='grid grid-cols-2'>
                        <div className='border-l-2  text-right pr-2'>{total.outwardQuantity === 0 ? '-' : (total.outwardQuantity.toFixed(noOfDecimalPlaces) + ' ' + unitCode)}</div>
                        <div className='border-l-2'>{total.outwardAmount === 0 ? '-' : total.outwardAmount}</div>
                    </div>
                </div>
                <div>
                    <div className='grid grid-cols-2'>
                        <div className='border-l-2 text-right pr-2'>{total.closingQuantity === 0 ? '-' : (total.closingQuantity.toFixed(noOfDecimalPlaces) + ' ' + unitCode)}</div>
                        <div className='border-l-2'>{total.closingAmount === 0 ? '-' : total.closingAmount}</div>
                    </div>
                </div>



            </div>
        </div>
    )
}