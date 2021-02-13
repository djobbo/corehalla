import { GetServerSideProps } from 'next';

export default function PlayerPage() {
	return <div>Weapons Stats</div>;
}

export const getServerSideProps: GetServerSideProps = async () => {
	return { redirect: { destination: '/', permanent: false } };
};
