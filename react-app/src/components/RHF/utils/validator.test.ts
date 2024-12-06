import { describe, expect, it } from "vitest";
import { validateOption } from "./validator";


describe("validators", ()=>{
        it('checks to see that a value matches', () =>{
            console.log('hi')
            const a = {
                "name": "test",
                "value": "test"
            }
            const validator = validateOption("test", [a])
            expect(validator.name).toBe(a.name)
        })
        it('checks to see that no values match', () =>{
            const a = {
                "name": "test",
                "value": "no match"
            }
            const validator = validateOption("test", [a])
            expect(validator).toBeUndefined()
        })

        
})
