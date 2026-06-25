





import { StockInHandVoucherWiseListSchema } from '../data/schema';
import { cn } from '@/lib/utils'
import { date_format } from '@/utils/removeEmptyStrings';
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { VoucherTypeColorMapping } from '../../day_book/data/data';
import { lowerCase } from 'lodash';



interface StockInHandVoucherWiseProps {
    data: StockInHandVoucherWiseListSchema
}

export default function StockInHandVoucherWise({ data: StockInHandVoucherWiseListSchema }: StockInHandVoucherWiseProps) {
    return (

        <>
            {StockInHandVoucherWiseListSchema.length === 0 ? (
                <div className='text-center text-gray-500'>No data available.</div>
            ) : (
                <ReportView
                    data={StockInHandVoucherWiseListSchema} />
            )}

        </>


    )
}

const ReportView = ({ data }: { data: StockInHandVoucherWiseListSchema }) => {
    return <div className='w-full h-[72vh]  grid grid-rows-[auto_1fr] '>
        <ReportHeader />
        <div className='border-2 border-t-0 overflow-y-auto h-full'>

            {data.map((item, index) => (
                <div key={index} className='grid grid-rows-1 gap-0'>
                    <div className={cn
                        ('grid grid-cols-[1fr_2fr] text-center  font-semibold', index % 2 === 0 ? 'bg-white' : 'bg-gray-100')
                    }>
                        <div className=' text-left pl-2'>
                            <Link to={'/reports/stock_summary/stock-in-hand'}
                                className='inline-block mr-2   hover:text-blue-700'
                            >

                                {item.itemName}
                            </Link>
                        </div>
                        <div className='grid grid-cols-4 '>

                            <div className='hidden grid-cols-2'>
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


                            <div className=' hidden grid-cols-2'>
                                <div className='text-right pr-2'>

                                    {item.closingQuantity === 0 ? '-' :
                                        `${item.closingQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                                </div>
                                <div>{item.closingAmount === 0 ? '-' : item.closingAmount?.toFixed(2)}</div>
                            </div>




                        </div>
                    </div>
                    <div>
                        {
                            item.voucherDetails.map((voucher, voucherIndex) => {


                                return (
                                    <div key={voucherIndex} className='text-sm italic text-gray-600'>
                                        <div className={cn
                                            ('grid grid-cols-[1fr_2fr] text-center  hover:bg-gray-200 hover:text-green-500 font-semibold', index % 2 === 0 ? 'bg-white' : 'bg-gray-100', !voucher.voucherId ? 'font-semibold text-red-400' : '')
                                        }>
                                            <div className=' text-left pl-8 font-semibold'>
                                                <Link to={'/reports/stock_summary/stock-in-hand-godown-wise'} className='inline-block mr-2   hover:text-blue-700'
                                                >
                                                    {
                                                        voucher.voucherId ?
                                                            (
                                                                <>
                                                                    <div className='grid grid-cols-[120px_120px_auto] mr-2 '>

                                                                        <div className={cn('font-mono px-2 h-4 shadow-md rounded-2xl text-xs   text-center', VoucherTypeColorMapping.get(lowerCase(voucher.voucherType ?? '').replace(/\s+/g, '_')))}>
                                                                            {voucher.voucherType} :
                                                                        </div>
                                                                        <div>
                                                                            <VoucherNavigationLink voucher={voucher} />

                                                                        </div>
                                                                        <div className='ml-2 text-muted-foreground'>Dated: {date_format(voucher.voucherDate)} </div>
                                                                    </div>

                                                                </>
                                                            )
                                                            :
                                                            `${voucher.voucherNo} `
                                                    }
                                                </Link>
                                            </div>
                                            <div className='grid grid-cols-4 '>
                                                <div className=' hidden  grid-cols-2'>
                                                    <div className='text-right pr-2'>
                                                        {voucher.openingQuantity === 0 ? '-' :
                                                            `${voucher.openingQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                                                    </div>
                                                    <div>{voucher.openingAmount === 0 ? '-' : voucher.openingAmount?.toFixed(2)}</div>
                                                </div>

                                                <div className='grid grid-cols-2'>
                                                    <div className='text-right pr-2'>

                                                        {voucher.inwardQuantity === 0 ? '-' :
                                                            `${voucher.inwardQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                                                    </div>
                                                    <div>{voucher.inwardAmount === 0 ? '-' : voucher.inwardAmount?.toFixed(2)}</div>
                                                </div>

                                                <div className='grid grid-cols-2'>
                                                    <div className='text-right pr-2'>

                                                        {voucher.outwardQuantity === 0 ? '-' :
                                                            `${voucher.outwardQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                                                    </div>
                                                    <div>{voucher.outwardAmount === 0 ? '-' : voucher.outwardAmount?.toFixed(2)}</div>
                                                </div>
                                                <div className=' hidden  grid-cols-2'>
                                                    <div className='text-right pr-2'>

                                                        {voucher.closingQuantity === 0 ? '-' :
                                                            `${voucher.closingQuantity?.toFixed(item.noOfDecimalPlaces)} ${item.unitCode}`}
                                                    </div>
                                                    <div>{voucher.closingAmount === 0 ? '-' : voucher.closingAmount?.toFixed(2)}</div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                )
                            })
                        }

                    </div>
                </div>
            ))}
        </div>
        <ReportFooter data={data} />
    </div >
}

const VoucherNavigationLink = ({ voucher }: { voucher: any }) => {
    const navigate = useNavigate();

    const handleOnclick = () => {
        const voucherType = voucher?.voucherType?.name.toLowerCase().replaceAll(" ", "_")
        navigate({
            to: `/transactions/vouchers/${voucherType}/${voucher.id}`,
        });
    }

    return (
        <div onClick={handleOnclick} className='hover:underline'>
            {voucher.voucherNo}
        </div>
    );
}

const ReportHeader = () => {
    return (
        <div className=' grid grid-cols-[1fr_2fr] border-amber-950! bg-gray-100  text-center font-bold  '>
            <div className='text-accent-foreground border-2 text-left pl-2 font-stretch-ultra-expanded  h-full flex items-center'>PARTICULARS</div>
            <div className='grid grid-cols-4 border-2 border-l-0'>
                <div className='hidden'>
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
                <div className='hidden'>
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


const ReportFooter = ({ data }: { data: StockInHandVoucherWiseListSchema }) => {
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
                    count: {data.length}
                </div>
                <div>
                    Total:
                </div>
            </div>
            <div className='grid grid-cols-4 border-b-2 border-l-0'>
                <div className='hidden'>
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
                <div className='hidden'>
                    <div className='grid grid-cols-2'>
                        <div className='border-l-2 text-right pr-2'>{total.closingQuantity === 0 ? '-' : (total.closingQuantity.toFixed(noOfDecimalPlaces) + ' ' + unitCode)}</div>
                        <div className='border-l-2'>{total.closingAmount === 0 ? '-' : total.closingAmount}</div>
                    </div>
                </div>



            </div>
        </div>
    )
}