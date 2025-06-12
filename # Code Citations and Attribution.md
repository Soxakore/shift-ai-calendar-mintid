# Code Citations and Attribution

This document tracks code snippets and patterns referenced from external repositories during development.

## UI Component Imports

### shadcn/ui Components

**License**: MIT Compatible  
**Description**: Standard UI component imports commonly used in React applications with shadcn/ui

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
```

**References**:

- [fitnesse-ui](https://github.com/ianlizzo/fitnesse-ui/blob/91145db07e2c1624b9a0825ebe35c47454971d53/src/app/page.tsx) - MIT License
- [Patient-Data-Management-System](https://github.com/rushithakkar873/Patient-Data-Management-System/blob/217d1336af4e09a0ca1ef3cd4aa00be1568d8af5/Frontend/src/components/PatientMedicalAndLIfeStyle.tsx) - License Unknown ⚠️

## Layout Patterns

### Separator with Centered Text

**License**: Unknown ⚠️  
**Source**: [umroh-app](https://github.com/LastationComp/umroh-app/blob/ef5168ad825b5bdaf69a728b2250745a5d8c96bd/app/%28auth%29/register/RegisterPage.tsx)

```tsx
<div className="absolute inset-0 flex items-center">
  <Separator className="w-full" />
</div>
<div className="relative flex justify-center text-xs uppercase">
  <span className="bg-background px-2 text-muted-foreground">
    Or
  </span>
</div>
```

## Attribution Summary

| Component | Source | License | Status |
|-----------|--------|---------|--------|
| UI Components | fitnesse-ui | MIT | ✅ Safe |
| UI Components | Patient-Data-Management-System | Unknown | ⚠️ Needs Review |
| Layout Pattern | umroh-app | Unknown | ⚠️ Needs Review |

## Compliance Actions Required

### Immediate Tasks

- [ ] **Investigate License Unknown repositories**
  - Patient-Data-Management-System
  - umroh-app
- [ ] **Verify compatibility** with project license
- [ ] **Document modifications** made to borrowed code
- [ ] **Add proper attribution** in production builds

### Legal Considerations

- MIT licensed code is generally safe for commercial use
- Unknown license code requires investigation before production deployment
- Consider implementing clean-room alternatives for unclear licenses

## Notes

- All shadcn/ui components follow established patterns and MIT licensing
- Custom implementations are project-specific adaptations
- This document should be updated when new external code is referenced
- Regular license compliance reviews recommended

---

**Last Updated**: June 12, 2025