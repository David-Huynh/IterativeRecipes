/*
 * This file is part of Iterative Recipes.
 *
 * Originally created by Kent C. Dodds.
 * Copyright (C) 2024 David Huynh <david@dhuynh.ca>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { type CreateReporter } from '@epic-web/cachified'

export type Timings = Record<
	string,
	Array<
		{ desc?: string } & (
			| { time: number; start?: never }
			| { time?: never; start: number }
		)
	>
>

export function makeTimings(type: string, desc?: string) {
	const timings: Timings = {
		[type]: [{ desc, start: performance.now() }],
	}
	Object.defineProperty(timings, 'toString', {
		value: function () {
			return getServerTimeHeader(timings)
		},
		enumerable: false,
	})
	return timings
}

function createTimer(type: string, desc?: string) {
	const start = performance.now()
	return {
		end(timings: Timings) {
			let timingType = timings[type]

			if (!timingType) {
				// eslint-disable-next-line no-multi-assign
				timingType = timings[type] = []
			}
			timingType.push({ desc, time: performance.now() - start })
		},
	}
}

export async function time<ReturnType>(
	fn: Promise<ReturnType> | (() => ReturnType | Promise<ReturnType>),
	{
		type,
		desc,
		timings,
	}: {
		type: string
		desc?: string
		timings?: Timings
	},
): Promise<ReturnType> {
	const timer = createTimer(type, desc)
	const promise = typeof fn === 'function' ? fn() : fn
	if (!timings) return promise

	const result = await promise

	timer.end(timings)
	return result
}

export function getServerTimeHeader(timings?: Timings) {
	if (!timings) return ''
	return Object.entries(timings)
		.map(([key, timingInfos]) => {
			const dur = timingInfos
				.reduce((acc, timingInfo) => {
					const time = timingInfo.time ?? performance.now() - timingInfo.start
					return acc + time
				}, 0)
				.toFixed(1)
			const desc = timingInfos
				.map(t => t.desc)
				.filter(Boolean)
				.join(' & ')
			return [
				key.replaceAll(/(:| |@|=|;|,|\/|\\)/g, '_'),
				desc ? `desc=${JSON.stringify(desc)}` : null,
				`dur=${dur}`,
			]
				.filter(Boolean)
				.join(';')
		})
		.join(',')
}

export function combineServerTimings(headers1: Headers, headers2: Headers) {
	const newHeaders = new Headers(headers1)
	newHeaders.append('Server-Timing', headers2.get('Server-Timing') ?? '')
	return newHeaders.get('Server-Timing') ?? ''
}

export function cachifiedTimingReporter<Value>(
	timings?: Timings,
): undefined | CreateReporter<Value> {
	if (!timings) return

	return ({ key }) => {
		const cacheRetrievalTimer = createTimer(
			`cache:${key}`,
			`${key} cache retrieval`,
		)
		let getFreshValueTimer: ReturnType<typeof createTimer> | undefined
		return event => {
			switch (event.name) {
				case 'getFreshValueStart':
					getFreshValueTimer = createTimer(
						`getFreshValue:${key}`,
						`request forced to wait for a fresh ${key} value`,
					)
					break
				case 'getFreshValueSuccess':
					getFreshValueTimer?.end(timings)
					break
				case 'done':
					cacheRetrievalTimer.end(timings)
					break
			}
		}
	}
}
