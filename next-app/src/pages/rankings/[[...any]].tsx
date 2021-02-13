import { GetServerSideProps } from 'next';

export default function RankingsPage() {
	return <div>Redirect</div>;
}

export const getServerSideProps: GetServerSideProps = async () => {
	return { redirect: { destination: '/rankings/1v1', permanent: true } };
};
