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

import { OTPInput, OTPInputContext } from 'input-otp'
import * as React from 'react'

import { cn } from '#app/utils/misc.tsx'

const InputOTP = React.forwardRef<
	React.ElementRef<typeof OTPInput>,
	React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
	<OTPInput
		ref={ref}
		containerClassName={cn(
			'flex items-center gap-2 has-[:disabled]:opacity-50',
			containerClassName,
		)}
		className={cn('disabled:cursor-not-allowed', className)}
		{...props}
	/>
))
InputOTP.displayName = 'InputOTP'

const InputOTPGroup = React.forwardRef<
	React.ElementRef<'div'>,
	React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('flex items-center', className)} {...props} />
))
InputOTPGroup.displayName = 'InputOTPGroup'

const InputOTPSlot = React.forwardRef<
	React.ElementRef<'div'>,
	React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
	const inputOTPContext = React.useContext(OTPInputContext)
	const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

	return (
		<div
			ref={ref}
			className={cn(
				'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
				isActive && 'z-10 ring-2 ring-ring ring-offset-background',
				className,
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
				</div>
			)}
		</div>
	)
})
InputOTPSlot.displayName = 'InputOTPSlot'

const InputOTPSeparator = React.forwardRef<
	React.ElementRef<'div'>,
	React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
	<div ref={ref} role="separator" {...props}>
		-
	</div>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
