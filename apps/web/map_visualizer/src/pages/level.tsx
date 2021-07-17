import { Layout } from '../components/Layout'
import { LevelMDSettings } from '../components/LevelMDSettings'
import { MapCanvas } from '../components/MapCanvas'

export default function LevelMDPage(): JSX.Element {
    return (
        <Layout>
            <LevelMDSettings />
            <MapCanvas floating />
        </Layout>
    )
}
