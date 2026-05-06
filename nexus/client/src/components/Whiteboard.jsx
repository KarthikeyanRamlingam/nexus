import { useEffect, useRef, useState, useCallback } from 'react'
import { Pencil, Eraser, Square, Circle, Minus, Trash2, Download, X } from 'lucide-react'

const COLORS = ['#e8ecf5','#4f8cff','#22d37a','#ff4f6a','#f5a623','#b47fff','#ff6b9d','#00d4ff']
const WIDTHS = [2, 4, 8, 14]

export default function Whiteboard({ events, onDraw, onClear, onClose }) {
  const canvasRef = useRef(null)
  const [tool, setTool] = useState('pen')   // pen | eraser | line | rect | circle
  const [color, setColor] = useState('#e8ecf5')
  const [width, setWidth] = useState(3)
  const [drawing, setDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const snapshotRef = useRef(null)
  const historyRef = useRef([])  // local stroke history for undo

  // Replay all remote events onto canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    events.forEach(e => drawStroke(ctx, e))
  }, [events])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const startDraw = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    setDrawing(true)
    setStartPos(pos)
    // Save snapshot for shape preview
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
  }, [tool])

  const draw = useCallback((e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)

    if (tool === 'pen' || tool === 'eraser') {
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = tool === 'eraser' ? width * 4 : width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else {
      // Restore snapshot and redraw shape preview
      ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.beginPath()
      if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      } else if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y)
      } else if (tool === 'circle') {
        const rx = Math.abs(pos.x - startPos.x) / 2
        const ry = Math.abs(pos.y - startPos.y) / 2
        const cx = startPos.x + (pos.x - startPos.x) / 2
        const cy = startPos.y + (pos.y - startPos.y) / 2
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }, [drawing, tool, color, width, startPos])

  const endDraw = useCallback((e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    setDrawing(false)

    const stroke = {
      tool, color,
      width: tool === 'eraser' ? width * 4 : width,
      startX: startPos.x, startY: startPos.y,
      endX: pos.x, endY: pos.y,
      timestamp: Date.now(),
    }

    // For pen, we need to store the path — simplified: store as line segment
    if (tool === 'pen' || tool === 'eraser') {
      ctx.closePath()
    }

    historyRef.current.push(stroke)
    onDraw(stroke)
    snapshotRef.current = null
  }, [drawing, tool, color, width, startPos, onDraw])

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    historyRef.current = []
    onClear()
  }

  const download = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `nexus-whiteboard-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div style={S.wrapper}>
      {/* Toolbar */}
      <div style={S.toolbar}>
        <div style={S.toolGroup}>
          {[
            { id: 'pen', Icon: Pencil, label: 'Pen' },
            { id: 'eraser', Icon: Eraser, label: 'Eraser' },
            { id: 'line', Icon: Minus, label: 'Line' },
            { id: 'rect', Icon: Square, label: 'Rect' },
            { id: 'circle', Icon: Circle, label: 'Circle' },
          ].map(({ id, Icon, label }) => (
            <button key={id} title={label}
              className={`btn-icon${tool === id ? ' active' : ''}`}
              onClick={() => setTool(id)}
              style={{ width: 32, height: 32 }}>
              <Icon size={13} />
            </button>
          ))}
        </div>

        <div style={S.divider} />

        {/* Colors */}
        <div style={S.colors}>
          {COLORS.map(c => (
            <div key={c} onClick={() => setColor(c)}
              style={{
                ...S.colorDot,
                background: c,
                boxShadow: color === c ? `0 0 0 2px var(--bg-surface), 0 0 0 3.5px ${c}` : 'none',
              }} />
          ))}
        </div>

        <div style={S.divider} />

        {/* Widths */}
        <div style={S.widths}>
          {WIDTHS.map(w => (
            <div key={w} onClick={() => setWidth(w)}
              style={{
                ...S.widthDot,
                width: w * 2.5 + 4, height: w * 2.5 + 4,
                background: width === w ? color : 'var(--text-muted)',
              }} />
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button className="btn-icon" title="Download" onClick={download} style={{ width: 32, height: 32 }}>
          <Download size={13} />
        </button>
        <button className="btn-icon danger" title="Clear" onClick={handleClear} style={{ width: 32, height: 32 }}>
          <Trash2 size={13} />
        </button>
        <button className="btn-icon" title="Close" onClick={onClose} style={{ width: 32, height: 32 }}>
          <X size={13} />
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1600} height={900}
        style={{
          ...S.canvas,
          cursor: tool === 'eraser' ? 'cell' : 'crosshair',
        }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
    </div>
  )
}

function drawStroke(ctx, stroke) {
  ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
  ctx.strokeStyle = stroke.color || '#e8ecf5'
  ctx.lineWidth = stroke.width || 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  const { tool, startX, startY, endX, endY } = stroke
  if (!tool || tool === 'pen' || tool === 'eraser') {
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  } else if (tool === 'line') {
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  } else if (tool === 'rect') {
    ctx.strokeRect(startX, startY, endX - startX, endY - startY)
  } else if (tool === 'circle') {
    const rx = Math.abs(endX - startX) / 2
    const ry = Math.abs(endY - startY) / 2
    ctx.ellipse(startX + (endX - startX) / 2, startY + (endY - startY) / 2, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
}

const S = {
  wrapper: {
    position: 'absolute', inset: 0, zIndex: 100,
    background: '#0a0c14',
    display: 'flex', flexDirection: 'column',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0, flexWrap: 'wrap',
  },
  toolGroup: { display: 'flex', gap: 4 },
  divider: { width: 1, height: 24, background: 'var(--border)', margin: '0 4px' },
  colors: { display: 'flex', gap: 5, alignItems: 'center' },
  colorDot: { width: 16, height: 16, borderRadius: '50%', cursor: 'pointer', transition: 'box-shadow 0.15s' },
  widths: { display: 'flex', gap: 6, alignItems: 'center' },
  widthDot: { borderRadius: '50%', cursor: 'pointer', transition: 'background 0.15s' },
  canvas: {
    flex: 1, width: '100%', height: '100%',
    display: 'block', touchAction: 'none',
  },
}
