<script lang="ts">
	import Input from './components/Input.svelte';
	import { getGloryFromBestRating, getGloryFromWins, getHeroRatingSquash, getPersonalRatingSquash, getTierFromRating } from '@corehalla/glory-calc';
	import { getNumberFromLocalStorage, getBoolFromLocalStorage, saveToLocalStorage } from './util/saveToLocalStorage';

	let wins = getNumberFromLocalStorage('wins');
	let rating = getNumberFromLocalStorage('rating', 1200);
	let personalRating = getNumberFromLocalStorage('personalRating', 1200);
	let heroRating = getNumberFromLocalStorage('heroRating', 1200);
	let enoughRankedGames = getBoolFromLocalStorage('enoughRankedGames');

	$: saveToLocalStorage('wins', wins);
	$: saveToLocalStorage('rating', rating);
	$: saveToLocalStorage('personalRating', personalRating);
	$: saveToLocalStorage('heroRating', heroRating);
	$: saveToLocalStorage('enoughRankedGames', enoughRankedGames);

	$: gloryWins = getGloryFromWins(wins);
	$: gloryRating = getGloryFromBestRating(rating);

	$: squashPersonal = getPersonalRatingSquash(personalRating);
	$: squashHero = getHeroRatingSquash(heroRating);
</script>

<main>
	<h1>New Season Glory & ELO Calculator</h1>
	<div class="form-group">
		<div class="form">
			<h2>Glory Calculator</h2>
			<div class="form-content">
				<label>
					<input type="checkbox" bind:checked={enoughRankedGames} />
					I have played 10 ranked games (or more).
				</label>
			</div>
			{#if enoughRankedGames}
				<div class="form-content">
					<Input bind:value={wins} min={0} max={10000} label="Wins (sum up all ranked playlists)" />
					Glory from wins:
					<span class="result">{gloryWins}</span>
				</div>
				<span class="operator">+</span>
				<div class="form-content">
					<Input bind:value={rating} min={200} max={4000} label="Best Rating" />
					Glory from best rating:
					<span class="result">{gloryRating}</span>
				</div>
				<span class="operator">=</span>
				<div class="form-content">
					Total Glory:
					<span class="result">{gloryWins + gloryRating}</span>
				</div>
			{:else}
				You gotta play at least 10 ranked games!
			{/if}
		</div>
		<div class="form">
			<h2>Elo Squash Calculator</h2>
			<div class="form-content">
				<Input bind:value={personalRating} min={200} max={4000} label="Personal Rating" />
				Personal Rating Squash:
				<span class="result">{squashPersonal} ({getTierFromRating(squashPersonal)[0]})</span>
			</div>
			<div class="form-content">
				<Input bind:value={heroRating} min={200} max={4000} label="Legend/Team Rating" />
				Legend/Team Rating Squash:
				<span class="result">{squashHero} ({getTierFromRating(squashHero)[0]})</span>
			</div>
		</div>
	</div>
</main>

<style>
	:global(body) {
		background-color: rgb(241, 241, 241);
		padding: 1rem;
		max-width: 968px;
		margin: 0 auto;
	}
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	h1 {
		font-size: 3rem;
		font-weight: normal;
		text-transform: uppercase;
		margin-bottom: 2rem;
	}

	h2 {
		margin-bottom: 1rem;
		font-size: 1.5rem;
	}
	
	.operator {
		text-align: center;
		font-size: 1rem;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-content {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		overflow: hidden;
		border-radius: 0.25rem;
		background-color: white;
		box-shadow: 0 0 1rem rgb(220, 220, 220);
	}

	.form-group {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: 2rem
	}
	
	.result {
		text-align: center;
		font-size: 1.25rem;
		font-weight: bold;
	}
</style>