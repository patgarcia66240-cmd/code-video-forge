import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Video,
  Code,
  Shield,
  Github,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || '/gallery';
      navigate(redirect);
    }
  }, [user, navigate, searchParams]);

  // Pré-remplir l'email si passé en paramètre
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Connexion réussie !');
      toast({
        title: "Bienvenue !",
        description: "Vous êtes maintenant connecté à Code Video Forge",
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
      toast({
        title: "Compte créé",
        description: "Vérifiez votre boîte mail pour confirmer votre inscription",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Fond animé */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>

          <div className="flex items-center gap-2 text-white/60">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Connexion sécurisée</span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl flex items-center gap-12">
            {/* Section gauche - Présentation */}
            <div className="hidden lg:flex flex-1 flex-col justify-center">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Code Video Forge</h1>
                </div>

                <h2 className="text-xl font-semibold text-white mb-4">Plateforme de création vidéo</h2>
                <p className="text-white/80 mb-8 leading-relaxed">
                  Transformez vos animations de code en vidéos professionnelles. Sauvegardez, partagez et gérez toutes vos créations dans un seul endroit.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code className="w-3 h-3 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Code animé</h3>
                      <p className="text-white/60 text-sm">Créez des animations de code interactives</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-3 h-3 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Export vidéo</h3>
                      <p className="text-white/60 text-sm">Générez des vidéos HD de vos animations</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Galerie cloud</h3>
                      <p className="text-white/60 text-sm">Sauvegardez vos vidéos dans le cloud Supabase</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section droite - Formulaire */}
            <div className="w-full lg:w-96">
              <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">Bienvenue</CardTitle>
                  <CardDescription className="text-white/70">
                    Connectez-vous ou créez votre compte pour accéder à votre galerie
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                      <TabsTrigger value="signin" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                        Connexion
                      </TabsTrigger>
                      <TabsTrigger value="signup" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                        Inscription
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="mt-6">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email" className="text-white/80 text-sm font-medium">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                            <Input
                              id="signin-email"
                              type="email"
                              placeholder="votre@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signin-password" className="text-white/80 text-sm font-medium">
                            Mot de passe
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                            <Input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="•••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Connexion en cours...
                            </div>
                          ) : (
                            'Se connecter'
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-6">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-white/80 text-sm font-medium">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="votre@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-white/80 text-sm font-medium">
                            Mot de passe
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Min. 6 caractères"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm" className="text-white/80 text-sm font-medium">
                            Confirmer le mot de passe
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                            <Input
                              id="signup-confirm"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirmer le mot de passe"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Création du compte...
                            </div>
                          ) : (
                            'Créer mon compte'
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  {/* Messages d'erreur et de succès */}
                  {error && (
                    <Alert className="mt-6 bg-red-500/10 border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mt-6 bg-green-500/10 border-green-500/20">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <AlertDescription className="text-green-400">
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <CardFooter className="flex-col gap-4 pt-0">
                  <Separator className="bg-white/10" />

                  <div className="text-center text-white/60 text-sm">
                    <p>
                      En vous connectant, vous acceptez nos{' '}
                      <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                        conditions d'utilisation
                      </a>{' '}
                      et notre{' '}
                      <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                        politique de confidentialité
                      </a>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-white/50 text-xs">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Sécurisé par Supabase</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Github className="w-3 h-3" />
                      <span>Open Source</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;