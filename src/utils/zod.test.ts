test("validation fails with required field", () => {
    const result = schema.safeParse(/* your test data */);
    
    if (!result.error) {
        throw new Error("Expected validation to fail");
    }
    expect(result.error.errors[0].message).toBe("Required");
});