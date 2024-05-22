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

import { type Meta } from '@sly-cli/sly'

/**
 * @type {import('@sly-cli/sly/dist').Transformer}
 */
export default function transformIcon(input: string, meta: Meta) {
	input = prependLicenseInfo(input, meta)

	return input
}

function prependLicenseInfo(input: string, meta: Meta): string {
	return [
		`<!-- Downloaded from ${meta.name} -->`,
		`<!-- License ${meta.license} -->`,
		`<!-- ${meta.source} -->`,
		input,
	].join('\n')
}
