import { ReactNode } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

interface LayoutProps {
  sidebar: ReactNode
  editor: ReactNode
  panel: ReactNode | null
  activityBar: ReactNode
  statusBar: ReactNode
  defaultLayout?: [number, number, number]
}

export const ResizableLayout: React.FC<LayoutProps> = ({
  sidebar,
  editor,
  panel,
  activityBar,
  statusBar,
  defaultLayout = [20, 60, 20]
}) => {
  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: '#0d0d0d', color: '#e5e5e5' }}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar (Fixed Width) */}
        <div
          className="w-12 flex flex-col items-center"
          style={{ background: '#0d0d0d', borderRight: '1px solid #1f1f1f' }}
        >
          {activityBar}
        </div>

        {/* Resizable Panels */}
        <PanelGroup direction="horizontal">
          {/* Sidebar */}
          <Panel defaultSize={defaultLayout[0]} minSize={15} maxSize={35}>
            {sidebar}
          </Panel>

          <PanelResizeHandle className="w-px transition-colors" style={{ background: '#1f1f1f' }} />

          {/* Editor */}
          <Panel defaultSize={panel ? defaultLayout[1] : 80} minSize={40}>
            {editor}
          </Panel>

          {/* Chat Panel (optional) */}
          {panel && (
            <>
              <PanelResizeHandle
                className="w-px transition-colors"
                style={{ background: '#1f1f1f' }}
              />
              <Panel defaultSize={defaultLayout[2]} minSize={20} maxSize={40}>
                {panel}
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Status Bar */}
      {statusBar}
    </div>
  )
}
