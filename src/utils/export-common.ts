export function generateChartImage(config: {
    labels: string[]
    datasets: {
        label: string
        data: number[]
    }[]
}): string | null {
    try {
        const canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 500
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        // White background
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const padding = 80
        const chartWidth = canvas.width - padding * 2
        const chartHeight = canvas.height - padding * 2
        
        const labels = config.labels
        const dataset = config.datasets[0]
        const data = dataset.data
        const maxVal = Math.max(...data, 1)

        // Draw Bars
        const barGap = 20
        const totalBarGapWidth = barGap * (data.length - 1)
        const barWidth = (chartWidth - totalBarGapWidth) / data.length
        
        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
        ]

        data.forEach((val: number, i: number) => {
            const x = padding + i * (barWidth + barGap)
            const h = (val / maxVal) * chartHeight
            const y = canvas.height - padding - h

            // Bar
            ctx.fillStyle = colors[i % colors.length]
            ctx.fillRect(x, y, barWidth, h)

            // Label (rotated)
            ctx.save()
            ctx.translate(x + barWidth / 2, canvas.height - padding + 15)
            ctx.rotate(Math.PI / 4)
            ctx.fillStyle = '#64748b'
            ctx.font = '12px Arial'
            ctx.textAlign = 'left'
            const label = labels[i] || ''
            ctx.fillText(label.length > 15 ? label.substring(0, 12) + '...' : label, 0, 0)
            ctx.restore()

            // Value
            ctx.fillStyle = '#1e293b'
            ctx.font = 'bold 12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(val.toString(), x + barWidth / 2, y - 10)
        })

        // Axes
        ctx.strokeStyle = '#cbd5e1'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(padding, padding / 2)
        ctx.lineTo(padding, canvas.height - padding)
        ctx.lineTo(canvas.width - padding / 2, canvas.height - padding)
        ctx.stroke()

        // Y-axis labels
        ctx.fillStyle = '#94a3b8'
        ctx.font = '10px Arial'
        ctx.textAlign = 'right'
        for (let i = 0; i <= 5; i++) {
            const val = Math.round((maxVal / 5) * i)
            const y = canvas.height - padding - (i / 5) * chartHeight
            ctx.fillText(val.toString(), padding - 10, y + 4)
            
            // Grid lines
            if (i > 0) {
                ctx.strokeStyle = '#f1f5f9'
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(padding, y)
                ctx.lineTo(canvas.width - padding / 2, y)
                ctx.stroke()
            }
        }

        // Title
        ctx.fillStyle = '#0f172a'
        ctx.font = 'bold 18px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(dataset.label, canvas.width / 2, padding / 2)

        return canvas.toDataURL('image/png')
    } catch (e) {
        console.error('Error generating chart image', e)
        return null
    }
}
