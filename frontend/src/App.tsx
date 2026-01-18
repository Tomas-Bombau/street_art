import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function App() {
  const handleHealthCheck = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      toast.success('Backend connected!', {
        description: `Status: ${data.status}`,
      })
    } catch {
      toast.error('Failed to connect to backend')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Street Art</h1>
      <p className="text-muted-foreground">
        Backend: Phoenix | Frontend: React + Vite
      </p>
      <Button onClick={handleHealthCheck}>
        Check Backend Connection
      </Button>
      <Toaster richColors />
    </div>
  )
}

export default App
