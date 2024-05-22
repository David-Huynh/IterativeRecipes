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

export function Spacer({
	size,
}: {
	/**
	 * The size of the space
	 *
	 * 4xs: h-4 (16px)
	 *
	 * 3xs: h-8 (32px)
	 *
	 * 2xs: h-12 (48px)
	 *
	 * xs: h-16 (64px)
	 *
	 * sm: h-20 (80px)
	 *
	 * md: h-24 (96px)
	 *
	 * lg: h-28 (112px)
	 *
	 * xl: h-32 (128px)
	 *
	 * 2xl: h-36 (144px)
	 *
	 * 3xl: h-40 (160px)
	 *
	 * 4xl: h-44 (176px)
	 */
	size:
		| '4xs'
		| '3xs'
		| '2xs'
		| 'xs'
		| 'sm'
		| 'md'
		| 'lg'
		| 'xl'
		| '2xl'
		| '3xl'
		| '4xl'
}) {
	const options: Record<typeof size, string> = {
		'4xs': 'h-4',
		'3xs': 'h-8',
		'2xs': 'h-12',
		xs: 'h-16',
		sm: 'h-20',
		md: 'h-24',
		lg: 'h-28',
		xl: 'h-32',
		'2xl': 'h-36',
		'3xl': 'h-40',
		'4xl': 'h-44',
	}
	const className = options[size]
	return <div className={className} />
}
